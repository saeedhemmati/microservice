const ShoppingService = require("../services/shopping-service");
const { PublishMessage, SubscribeMessage } = require("../utils");
const  UserAuth = require('./middlewares/auth');
const { CUSTOMER_SERVICE, CUSTOMER_BINDING_KEY } = require('../config');

module.exports = (app, channel) => {
    
    const service = new ShoppingService();

    SubscribeMessage(channel, service)

    app.post('/order',UserAuth, async (req,res,next) => {

        const { _id } = req.user;
        const { txnNumber } = req.body;
        try {
            const { data } = await service.PlaceOrder({_id, txnNumber});
            
            const payload = await service.GetOrderPayload(_id, data, 'CREATE_ORDER')
    
            PublishMessage(channel , CUSTOMER_BINDING_KEY, JSON.stringify(payload))
            res.status(200).json(data);

        } catch(e) {
            throw e;
        }

    });

    app.get('/orders',UserAuth, async (req,res,next) => {

        const { _id } = req.user;
        try{
            const { data } = await service.GetOrders(_id);
            res.status(200).json(data);

        }catch(e){
            throw e
        }
        

    });

    app.put('/cart',UserAuth, async (req,res,next) => {

        const { _id } = req.user;
        try {
            const { data } = await service.AddToCart(_id, req.body._id);
            res.status(200).json(data);

        } catch (err){
            throw err
        }

        

    });

    app.delete('/cart/:id',UserAuth, async (req,res,next) => {

        const { _id } = req.user;


        const { data } = await service.AddToCart(_id, req.body._id);
        
        res.status(200).json(data);

    });
    
    app.get('/cart', UserAuth, async (req,res,next) => {

        const { _id } = req.user;
        
        const { data } = await service.GetCart({ _id });

        return res.status(200).json(data);
    });

    app.get('/whoami', (req,res,next) => {
        return res.status(200).json({msg: '/shoping : I am Shopping Service'})
    })
 
}