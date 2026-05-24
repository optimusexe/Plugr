import { EmailClient } from "@azure/communication-email";
import { SmsClient } from "@azure/communication-sms";
import {
  getAzureCommunicationConnectionString,
  getAzureCommunicationEmailSender,
  getAzureCommunicationSmsFrom,
} from "./config";

let emailClient: EmailClient | null = null;
let smsClient: SmsClient | null = null;

function getEmailClient(): EmailClient | null {
  if (emailClient) {
    return emailClient;
  }

  const connectionString = getAzureCommunicationConnectionString();
  const sender = getAzureCommunicationEmailSender();

  if (!connectionString || !sender) {
    return null;
  }

  emailClient = new EmailClient(connectionString);
  return emailClient;
}

function getSmsClient(): SmsClient | null {
  if (smsClient) {
    return smsClient;
  }

  const connectionString = getAzureCommunicationConnectionString();

  if (!connectionString) {
    return null;
  }

  smsClient = new SmsClient(connectionString);
  return smsClient;
}

export async function sendOtpEmail(to: string, code: string): Promise<boolean> {
  const client = getEmailClient();
  const sender = getAzureCommunicationEmailSender();

  if (!client || !sender) {
    return false;
  }

  const message = {
    senderAddress: sender,
    content: {
      subject: "Your Plugr verification code",
      plainText: `Your Plugr verification code is ${code}. It expires in 15 minutes.`,
    },
    recipients: {
      to: [{ address: to }],
    },
  };

  const poller = await (client as unknown as { beginSend: (payload: typeof message) => Promise<{ pollUntilDone: () => Promise<unknown> }> }).beginSend(message);
  await poller.pollUntilDone();
  return true;
}

export async function sendOtpSms(to: string, code: string): Promise<boolean> {
  const client = getSmsClient();
  const from = getAzureCommunicationSmsFrom();

  if (!client || !from) {
    return false;
  }

  await (client as unknown as { send: (payload: { from: string; to: string; message: string }) => Promise<unknown> }).send({
    from,
    to,
    message: `Your Plugr verification code is ${code}. It expires in 15 minutes.`,
  });

  return true;
}