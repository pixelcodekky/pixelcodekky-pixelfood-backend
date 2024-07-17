import { Response, Request } from 'express';
import Stripe from "stripe";
import 'dotenv/config';
import Restaurant, { MenuItemType } from '../models/restaurant';
import Order from '../models/order';

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);

const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;
const STRIPE_CURRENCY = process.env.STRIPE_CURRENCY as string

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
        const orders = await Order.find({user: req.userId}).sort({createdAt: -1}).populate('restaurant').populate('user');
        
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

    } catch (error: any) {
        console.log(error)
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if(event?.type === 'checkout.session.completed'){
        const order = await Order.findById(event.data.object.metadata?.orderId);
        if(!order){
            return res.status(404).json({message: 'Order not found'});
        }

        order.totalAmount = event.data.object.amount_total;
        order.status = "paid";

        await order.save();
    }

    res.status(200).send();

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
                    price: menu.price ? parseFloat((menu.price / 100).toFixed(2)) : 0
                }
            }
        });

        const updatedcheckoutSessionRequest = {
            ...checkoutSessionRequest,
            cartItems: updatedCardItems
        }

        const newOrder = new Order({
            restaurant: restaurant,
            user: req.userId,
            status: 'placed',
            gst: checkoutSessionRequest.gst,
            deliveryfee: checkoutSessionRequest.deliveryfee,
            deliveryDetails: checkoutSessionRequest.deliveryDetails,
            cartItems: updatedcheckoutSessionRequest.cartItems, //checkoutSessionRequest.cartItems,
        });

        const lineItems = createLineItems(checkoutSessionRequest, restaurant.menuItems);
        const gstLineItem = createGSTLineItems(lineItems, checkoutSessionRequest.gst, checkoutSessionRequest.deliveryfee);

        const updatedLineItems = [...lineItems, gstLineItem];

        const session = await createSession(updatedLineItems, newOrder._id.toString(), restaurant.deliveryPrice, restaurant._id.toString());

        if(!session.url){
            return res.status(500).json({message: "error creating stripe session"});
        }

        await newOrder.save();

        res.json({url: session.url});
    } catch (error: any) {
        console.log(error.message);
        res.status(500).json({ message: error });
    }
}

const createLineItems = (checkoutSessionRequest: checkOutSessionRequest, menuItems: MenuItemType[]) => {
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

const createSession = async (lineItems: Stripe.Checkout.SessionCreateParams.LineItem[], orderId: string, deliveryPrice: number, restaurantId: string) => {
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
                    }
                }
            }
        ],
        mode: "payment",
        metadata: {
            orderId, restaurantId,
        },
        success_url: `${FRONTEND_URL}/order_status?success=true`,
        cancel_url: `${FRONTEND_URL}/details/${restaurantId}?cancelled=true`,
    });

    return sessionData;
}

export default {
    createCheckoutSession,
    stripeWebhookHandler,
    getMyOrders
}
