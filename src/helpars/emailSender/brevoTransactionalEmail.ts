import {
  SendSmtpEmail,
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from "@getbrevo/brevo";
import config from "../../config";
let apiInstance = new TransactionalEmailsApi();

apiInstance.setApiKey(
  TransactionalEmailsApiApiKeys.apiKey,
  config.brevo.api_key as string
);

export const brevoTransactionalEmail = async (
  subject: string,
  recipientEmail: string,
  html: string
) => {
  let sendSmtpEmail = new SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  sendSmtpEmail.sender = {
    name: "My Financial Trading",
    email: "myfinancialtrade@gmail.com",
  };
  sendSmtpEmail.to = [
    { email: recipientEmail, name: recipientEmail.split("@")[0] },
  ];
  sendSmtpEmail.replyTo = {
    email: "myfinancialtrade@gmail.com",
    name: "My Financial Trading",
  };
  sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
  sendSmtpEmail.params = {
    parameter: "My param value",
    subject: "common subject",
  };

  //   apiInstance.sendTransacEmail(sendSmtpEmail).then(
  //     function (data) {
  //       console.log(
  //         "API called successfully. Returned data: " + JSON.stringify(data)
  //       );
  //     },
  //     function (error) {
  //       console.error(error);
  //     }
  //   );
  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    // console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
