import { StripeProvider } from "./StripeProvider.js";
import { PayPalProvider } from "./PayPalProvider.js";
import { ChapaProvider } from "./ChapaProvider.js";
import { TelebirrProvider } from "./TelebirrProvider.js";
import { CBEBirrProvider } from "./CBEBirrProvider.js";

const providerInstances = {
  Stripe: new StripeProvider(),
  PayPal: new PayPalProvider(),
  Chapa: new ChapaProvider(),
  Telebirr: new TelebirrProvider(),
  "CBE Birr": new CBEBirrProvider(),
};

export const getPaymentProvider = (method) => providerInstances[method] || null;

export const isOnlinePaymentMethod = (method) =>
  Boolean(providerInstances[method]);

export {
  StripeProvider,
  PayPalProvider,
  ChapaProvider,
  TelebirrProvider,
  CBEBirrProvider,
};
