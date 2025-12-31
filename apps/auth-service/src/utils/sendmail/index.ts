import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";

dotenv.config();
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 465,
        service: process.env.SMTP_SERVICE,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });


    //render the ejs mail template

const renderEmailTemplate = async (templateName: string, data: Record<string, any>) : Promise<string> => {
    const templatePath = path.join(
        process.cwd(),
        "apps",
        "auth-service",
        "src",
        "utils",
        "email-templates",
        `${templateName}.ejs`

    )
    return ejs.renderFile(templatePath, data);
}

// send the mail
export const sendMail = async (to: string, subject: string, templateName: string, Data: Record<string, any>) => {
    try {
        const htmlContent = await renderEmailTemplate(templateName, Data);
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            html: htmlContent
        });
    } catch (error) {
        console.error("Error sending email:", error);
    }
}
