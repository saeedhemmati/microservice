
module.exports = (app) => {
  // const service= new Productser()
  app.use('/app-events', async (req, res, next) => {
    const { payload } = req.body
    service.SubscribeEvents(payload)
    console.log('================= products service received event')
    return res.json(payload)
  })
}