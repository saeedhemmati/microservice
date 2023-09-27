const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const amqplib = require('amqplib');

const { APP_SECRET, MESSAGE_BROKER_URL, EXCHANGE_NAME } = require("../config");

//Utility functions
module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.get("Authorization");
    console.log(signature);
    const payload = await jwt.verify(signature.split(" ")[1], APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

module.exports.CreateChannel = async () => {
  try {
    const connection = await amqplib.connect(MESSAGE_BROKER_URL)
    const channel = await connection.createChannel()
    await channel.assertExchange(EXCHANGE_NAME, 'direct', false)
    return channel

  } catch (err) {
    throw err
  }
}

module.exports.PublishMessage = async (channel, binding_key, message) => {
  try {
    await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message))
    console.log('message has been sent:' + message)
  } catch (err) {
    throw err
  }
}

module.exports.SubscribeMessage = async (channel, service, binding_key) => {
  try {
    const appQueue = await channel.assertQueue('QUEUE_NAME')
    channel.bindQueue(appQueue.queue, EXCHANGE_NAME, binding_key)
    channel.consume(appQueue.queue, data => {
      console.log('data received')
      console.log(data.content.toString())
      channel.ack(data)
    })
  } catch (err) {
    throw err
  }
}