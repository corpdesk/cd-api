import fs from "fs";
import os from "os";
import config, { empMailConfig } from "../../../../config";
import { htmlToText } from "html-to-text";
// import nodemailer from "nodemailer";


export interface MailConfig {
  service?: string;
  email?: string;
  host?: string; // Example: "mail.yourdomain.com"
  domain?: string; // yourdomain.com
  port?: number; // Use 465 for SSL or 587 for TLS
  secure?: boolean; // true for SSL, false for TLS
  auth?: {
    user: string; // Example: "you@yourdomain.com"
    pass: string;
  };
  dkim?: {
    domainName: string; // Your domain
    keySelector: string; // DKIM selector from cPanel or DNS
    privateKey: string; // fs.readFileSync("./dkim-private.key", "utf8"), // Private DKIM key file
  };
}

export const ZOHO_CONFIG_1 = {
  service: "Zoho", // no need to set host or port etc. See alternative at top of file.
  auth: config.emailUsers[0].auth,
};

export const EMP_CONFIG_1 = {
  host: empMailConfig.outgoingServer, // Example: "mail.yourdomain.com"
  port: empMailConfig.smtpPort, // Use 465 for SSL or 587 for TLS
  secure: true, // true for SSL, false for TLS
  auth: getAuthByName('asdap-admin'),
  dkim: {
    domainName: empMailConfig.domain, // Your domain
    keySelector: "default", // DKIM selector from cPanel or DNS
    privateKey: fs.readFileSync(`${os.homedir()}/.ssh/dkim-empservices-01-private.key`, "utf8"), // Private DKIM key file
  },
};

export const EMP_CONFIG_2 = {
    host: empMailConfig.outgoingServer, // e.g., "mail.yourdomain.com"
    port: 465, // Use 465 for SSL, or 587 for TLS
    secure: true, // true for 465, false for 587
    auth: getAuthByName('asdap-admin'),
  }

export function getEmailByName(name: string): string | null {
  const user: MailConfig = config.emailUsers.find(
    (user) => user.name.toLowerCase() === name.toLowerCase()
  );
  return user ? user.email : null;
}

export function getAuthByName(name: string): object | null {
  const user = config.emailUsers.find(
    (user) => user.name.toLowerCase() === name.toLowerCase()
  );
  return user ? user.auth : null;
}

export function stripHTML(html: string): string {
    return htmlToText(html, {
      wordwrap: false,
      selectors: [
        { selector: "img", format: "skip" }, // Optional: To skip images
      ],
    });
  }
