
export function registerNotifTemplate(regUser){
    return `
    <p>Welcome ${regUser.fname},</p>
    <p>Thank you for regisering with CORPDESK.</p>
    <p>Follow this  <a href="http://corpdesk.io?key=${regUser.activationKey}">link</a> </p>
    <p>CORPDESK Team</p>
    `;
}