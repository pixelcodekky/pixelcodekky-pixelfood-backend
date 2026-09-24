import { Response, Request } from 'express';
import Stripe from "stripe";
import 'dotenv/config';
import Restaurant, { MenuItemType } from '../models/restaurant';
import Order from '../models/order';
import { generateuuid } from '../common';

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);

const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;
const STRIPE_CURRENCY = process.env.STRIPE_CURRENCY as string
const STRIPE_GST_PERCENT = process.env.STRIPE_GST_PERCENT as string;

type checkOutSessionRequest = {
    cartItems: {
        menuItemId: string;
        name: string;
        quantity: string;
        price: number;
    }[];
    deliveryDetails: {
        email:string;
        name:string;
        addressLine1:string;
        city:string;
    };
    restaurantId: string;
    gst:number;
    deliveryfee:number;
}

const getMyOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({user: req.userId}).sort({createdAt: -1}).populate({ path: 'restaurant', populate: { path: 'address' } }).populate('user');
        
        res.json(orders);

    } catch (error) {
        console.log(error);
        res.status(500).json({message: `Fail to get Order`});
    }
}
const stripeWebhookHandler = async (req: Request, res: Response) => {
    let event;
    try {
        const sig = req.headers['stripe-signature'];
        event = await STRIPE.webhooks.constructEvent(req.body, sig as string, STRIPE_ENDPOINT_SECRET);
        //console.log(event);

    } catch (error: any) {
        console.log(error)
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if(event?.type === 'checkout.session.completed'){
        console.log('Checkout session completed event received');
        let eventresult = await handleCheckoutSessionCompleted(event);        
        if(!eventresult?.status){
            return res.status(404).json({message: eventresult?.message});
        }
    }else if(event?.type === 'checkout.session.expired'){
        let eventresult = await handleCheckoutSessionExpired(event);
        if(!eventresult?.status){
            return res.status(404).json({message: eventresult?.message});
        }
    }else if(event?.type === 'charge.succeeded'){
        console.log('Charge succeeded event received');
        //save to log for this transaction
        let eventresult = await handleChargeSucceeded(event);
        
    }else if(event.type === 'charge.failed'){
        let eventresult = await handleChargeFailed(event as Stripe.ChargeFailedEvent);
    }else if(event.type === 'charge.refunded'){
        let eventresult = await handleChargeRefunded(event as Stripe.ChargeRefundedEvent);
        if(!eventresult?.status){
            return res.status(404).json({message: eventresult?.message});
        }
    }

    res.status(200).send();
}

const handleCheckoutSessionCompleted = async (event: Stripe.CheckoutSessionCompletedEvent) => {
    try {
        const order = await Order.findById(event.data.object.metadata?.orderId);
        
        if(!order){
            return {status: false, message: 'Order not found'}
        }

        order.totalAmount = event.data.object.amount_total;
        order.status = "paid";
        order.payment_status = event.data.object.payment_status;
        order.payment_intent = event.data.object.payment_intent?.toString(); //for refund or dispute, use payment_intent id to lookup object
        
        await order.save();

        return {status: true, message: "Order payment Updated."}
    } catch (error) {
        console.log(error);
        return {status: false, message: error}
    }
}

const handleCheckoutSessionExpired = async (event: Stripe.CheckoutSessionExpiredEvent) => {
    //update Order
    try {

        const order = await Order.findById(event.data.object.metadata?.orderId);
        
        if(!order){
            return {status: false, message: 'Order not found'}
        }

        order.payment_status = event.data.object.payment_status;
        order.payment_intent = event.data.object.payment_intent?.toString(); 
        
        await order.save();
        return {status: false, message: "Checkout session expired."}
    } catch (error) {
        return {status: false, message: error};
    }
}

const handleChargeSucceeded = async (event: Stripe.ChargeSucceededEvent) => {
    //save to log for this transaction
    //event.data.object.payment_method_details?.card?.network; // Visa, Master, AmericanExpress
    //event.data.object.payment_method_details?.card?.last4; // last 4 digit of card
    //event.data.object.receipt_url // to check receipt from stripe
    //event.data.object.payment_intent // to track for payment intent history.
    
    //update Charge Id
    try {
        const charge = event.data.object;
        let metadata = charge.metadata;

        if(!Object.keys(metadata).length && charge.payment_intent){
            const paymentIntent = await STRIPE.paymentIntents.retrieve(charge.payment_intent.toString());

            if(!paymentIntent.metadata || !Object.keys(paymentIntent.metadata).length){
                console.log(`No metadata found in this payment_intent ${charge.payment_intent}`);
                return {status: false, message: "No metadata found in this payment_intent ${charge.payment_intent}"};
            }

            metadata = paymentIntent.metadata;

            const order = await Order.findById(metadata.orderId);
        
            if(!order){
                return {status: false, message: 'Order not found'}
            }

            order.charge_id = event.data.object.id; //for refund or dispute, use
            order.refunded = event.data.object.refunded;
            order.receipt_url = event.data.object.receipt_url;

            await order.save();
            return {status: true, message: "Charge Successful"}
        }else{
            return {status: false, message: "No metadata found in this payment_intent ${metadata.payment_intent}"};
        }
        
    } catch (error) {
        return {status: false, message: error};
    }
}

const handleChargeFailed = async (event: Stripe.ChargeFailedEvent) => {
    //event.data.object.failure_code // get card faliure code
    //event.data.object.failure_message // error message
    //update Charge Id
    try {
        const order = await Order.findById(event.data.object.metadata?.orderId);
        
        if(!order){
            return {status: false, message: 'Order not found'}
        }

        order.faliure_code = event.data.object.failure_code
        order.faliure_message = event.data.object.failure_message
        order.charge_id = event.data.object.id;

        await order.save();
        return {status: false, message: "Charge Failed"}

    } catch (error) {
        return {status: false, message: error};
    }
}



const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        let checkoutSessionRequest: checkOutSessionRequest = req.body;
        const restaurant = await Restaurant.findById(
            checkoutSessionRequest.restaurantId
        );

        if(!restaurant){
            throw new Error(`Restaurant not found`);
        }

        //update price for future reference
        let menuitems = [...restaurant.menuItems];
        const updatedCardItems = checkoutSessionRequest.cartItems.map((cartItem) => {
            let menu = menuitems.find((x) => x._id.toString() === cartItem.menuItemId);
            if(menu){
                return {
                    ...cartItem,
                    price: menu.price ? menu.price : 0
                }
            }
        });

        const updatedcheckoutSessionRequest = {
            ...checkoutSessionRequest,
            cartItems: updatedCardItems
        }

        const uuid = generateuuid();
        const newOrder = new Order({
            restaurant: restaurant,
            user: req.userId,
            status: 'placed',
            gst: checkoutSessionRequest.gst,
            deliveryfee: checkoutSessionRequest.deliveryfee,
            deliveryDetails: checkoutSessionRequest.deliveryDetails,
            cartItems: updatedcheckoutSessionRequest.cartItems, //checkoutSessionRequest.cartItems,
            reference_id: `${uuid}-${Date.now()}`,
        });

        const taxRateID = ""; //await createTaxRate();
        const lineItems = await createLineItems(checkoutSessionRequest, restaurant.menuItems, taxRateID);
        //const gstLineItem = createGSTLineItems(lineItems, checkoutSessionRequest.gst, checkoutSessionRequest.deliveryfee);
        //const deliveryItem = await createDeliveryLineItem(restaurant.deliveryPrice, taxRateID);
        //const updatedLineItems = [...lineItems, gstLineItem];
        //const updatedLineItems = [...lineItems, deliveryItem];

        const session = await createSession(lineItems, newOrder._id.toString(), restaurant.deliveryPrice, restaurant._id.toString(), taxRateID);

        if(!session.url){
            return res.status(500).json({message: "error creating stripe session"});
        }

        await newOrder.save();

        const expiredtime = session.expires_at;

        res.json({url: session.url});
    } catch (error: any) {
        console.log(error.message);
        res.status(500).json({ message: error });
    }
}

const createTaxRate = async () => {
    try {
        const taxRate = await STRIPE.taxRates.create({
            display_name: 'GST',
            description: 'GST 9%',
            jurisdiction: 'Singapore',
            country: 'SG',
            percentage: parseInt(STRIPE_GST_PERCENT),
            inclusive: false,
        });

        return taxRate.id;
    } catch (error) {
        console.log(error);
        return "";
    }
}

const createLineItems = async (checkoutSessionRequest: checkOutSessionRequest, menuItems: MenuItemType[], taxRateID: string) => {
    
    const lineItems = checkoutSessionRequest.cartItems.map((item) => {
        const menuItem = menuItems.find((d) => d._id.toString() === item.menuItemId.toString());

        if(!menuItem){
            throw new Error(`Menu item not found: ${item.menuItemId}`);
        }

        const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
            price_data: {
                currency: STRIPE_CURRENCY || "gbp",
                unit_amount: menuItem.price || 0,
                product_data: {
                    name: menuItem.name || "",
                },
            },
            quantity: parseInt(item.quantity),
        }
        return line_item;
    });

    return lineItems;
}

const createGSTLineItems = (lineItems: Stripe.Checkout.SessionCreateParams.LineItem[], gst: number, deliveryfee: number) => {
    const subTotal = lineItems.reduce((total, item) => total + (item.price_data?.unit_amount ?? 0) * (item.quantity ?? 1), 0);

    const totalwithDelivery = subTotal + deliveryfee;

    const exclGST = (parseFloat((totalwithDelivery / 100).toFixed(2)) * gst) / (100);

    const unitAmount = parseFloat(exclGST.toFixed(2)) * 100;

    const gstLineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
        price_data: {
            currency: STRIPE_CURRENCY || "gbp",
            product_data: {
                name: `GST ${gst}%`,
            },
            unit_amount: unitAmount,
        },
        quantity: 1,
    };

    return gstLineItem;
}

const createDeliveryLineItem = (deliveryfee: number, taxRateID: string) => {
    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
        price_data: {
            currency: STRIPE_CURRENCY || "gbp",
            unit_amount: deliveryfee,
            product_data: {
                name: "Delivery Fee",
            },
        },
        quantity: 1,
        tax_rates: [taxRateID],
    };

    return line_item;
}

const createSession = async (lineItems: Stripe.Checkout.SessionCreateParams.LineItem[], orderId: string, deliveryPrice: number, restaurantId: string, taxRateID: string) => {

    const sessionData = await STRIPE.checkout.sessions.create({
        line_items: lineItems,
        shipping_options: [
            {
                shipping_rate_data:{
                    display_name: "Delivery",
                    type:"fixed_amount",
                    fixed_amount: {
                        amount: deliveryPrice,
                        currency: STRIPE_CURRENCY || "gbp",
                    },
                    tax_behavior: 'exclusive',
                    tax_code: 'txcd_20030000'
                },
            }
        ],
        automatic_tax:{
            enabled: true,
        },
        mode: "payment",
        metadata: {
            orderId, restaurantId,
        },
        success_url: `${FRONTEND_URL}/order/${orderId}/track`,
        cancel_url: `${FRONTEND_URL}/detail/${restaurantId}`,
    });

    // const sessionData = await STRIPE.checkout.sessions.create({
    //     line_items: lineItems,
    //     mode: "payment",
    //     metadata: {
    //         orderId, restaurantId,
    //     },
    //     success_url: `${FRONTEND_URL}/order_status`,
    //     cancel_url: `${FRONTEND_URL}/detail/${restaurantId}`,
    //     client_reference_id: `${uuid}-${Date.now()}`,
    // });


    return sessionData;
}



const handleChargeRefunded = async (event: Stripe.ChargeRefundedEvent) => {
    try {
        const order = await Order.findOne({ charge_id: event.data.object.id });

        if(!order){
            return {status: false, message: 'Order not found'}
        }

        const latestRefund = event.data.object.refunds?.data?.[0];

        order.refunded = event.data.object.refunded;
        order.status = "refunded";
        if(latestRefund){
            order.refund_id = latestRefund.id;
            order.refund_amount = latestRefund.amount;
            order.refund_reason = latestRefund.reason ?? undefined;
        }

        await order.save();
        return {status: true, message: "Charge refunded."}
    } catch (error) {
        return {status: false, message: error};
    }
}

const refundOrder = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body as { reason?: Stripe.RefundCreateParams.Reason };

        const order = await Order.findById(orderId);

        if(!order){
            return res.status(404).json({message: "Order not found"});
        }

        // if(order.user.toString() !== req.userId){
        //     return res.status(403).json({message: "Unauthorized"});
        // }

        const refundableStatuses = ["paid", "inProgress", "outForDelivery"];
        if(!refundableStatuses.includes(order.status as string)){
            return res.status(400).json({message: `Order cannot be refunded in status: ${order.status}`});
        }

        if(!order.charge_id){
            return res.status(400).json({message: "No charge found for this order"});
        }

        const refundParams: Stripe.RefundCreateParams = {
            charge: order.charge_id,
        };
        if(reason) refundParams.reason = reason;

        const refund = await STRIPE.refunds.create(refundParams);

        if(refund.status === 'failed'){
            return res.status(500).json({message: "Refund failed", refund_id: refund.id});
        }

        order.refunded = true;
        order.status = "refunded";
        order.refund_id = refund.id;
        order.refund_amount = refund.amount;
        order.refund_reason = refund.reason ?? undefined;

        await order.save();

        res.json({
            message: "Refund initiated successfully",
            refund_id: refund.id,
            refund_status: refund.status,
            refund_amount: refund.amount,
        });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({message: error?.message ?? "Refund failed"});
    }
}

export default {
    createCheckoutSession,
    stripeWebhookHandler,
    getMyOrders,
    refundOrder,
}
