// import fetch from "node-fetch";
const fetch = require("node-fetch");

const { CLIENT_ID, APP_SECRET } = process.env;
const base = "https://api-m.sandbox.paypal.com";

module.exports.createOrder = function createOrder(value) {
  value = (value/79.65).toFixed(2)
  return new Promise(async (resolve, reject) => {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    try{
      const response = await fetch(url, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: value,
              },
            },
          ],
        }),
      });
      resolve(handleResponse(response));
    } catch (err) {
      console.log(err)
    }
  });
};

module.exports.capturePayment = async function capturePayment(orderId) {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return handleResponse(response);
};

async function generateAccessToken() {
  const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "post",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const jsonData = await handleResponse(response);
  return jsonData.access_token;
}

async function handleResponse(response) {
  if (response.status === 200 || response.status === 201) {
    return response.json();
  }

  const errorMessage = await response.text();
  throw new Error(errorMessage);
}