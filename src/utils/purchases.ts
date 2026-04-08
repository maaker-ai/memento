import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const RC_IOS_KEY = 'appl_aUbInCwRpvnhEtwyUoEMgGeDddH';
const RC_ANDROID_KEY = ''; // TODO: add when Android app is set up
const RC_TEST_KEY = 'test_dGYBqQyFwyGuHgRWzehaBzHxoqV';
const ENTITLEMENT_ID = 'pro';

export async function initPurchases() {
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  const apiKey = __DEV__
    ? RC_TEST_KEY
    : Platform.OS === 'ios'
      ? RC_IOS_KEY
      : RC_ANDROID_KEY;

  if (!apiKey) {
    console.warn('RevenueCat: No API key configured, skipping init');
    return;
  }

  Purchases.configure({ apiKey });
}

export async function checkProStatus(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return !!info.entitlements.active[ENTITLEMENT_ID];
  } catch {
    return false;
  }
}

export async function getOfferings() {
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePackage(pkg: any): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
  } catch (e: any) {
    if (!e.userCancelled) throw e;
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  const info = await Purchases.restorePurchases();
  return !!info.entitlements.active[ENTITLEMENT_ID];
}
