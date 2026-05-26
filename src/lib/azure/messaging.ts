import { EmailClient } from "@azure/communication-email";
import { SmsClient } from "@azure/communication-sms";
import {
  getAzureCommunicationConnectionString,
  getAzureCommunicationEmailSender,
  getAzureCommunicationSmsFrom,
} from "./config";
import { verificationTemplate } from "@/lib/email-templates/verification";
import { genericTemplate } from "@/lib/email-templates/generic";

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

  const { subject, plainText, html } = verificationTemplate(code);

  const message = {
    senderAddress: sender,
    content: {
      subject,
      plainText,
      html,
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

export async function sendEmail(to: string, subject: string, plainText: string): Promise<boolean> {
  const client = getEmailClient();
  const sender = getAzureCommunicationEmailSender();

  if (!client || !sender) {
    return false;
  }

  const { html } = genericTemplate(subject, plainText);

  const message = {
    senderAddress: sender,
    content: {
      subject,
      plainText,
      html,
    },
    recipients: {
      to: [{ address: to }],
    },
  };

  const poller = await (client as unknown as { beginSend: (payload: typeof message) => Promise<{ pollUntilDone: () => Promise<unknown> }> }).beginSend(message);
  await poller.pollUntilDone();
  return true;
}