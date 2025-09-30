export const passwordRecovery = ({ link }: { link: string }) => {
  return `
	<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Новое письмо</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,700&display=swap"
        em-class="em-font-Roboto-Bold">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400&display=swap"
        em-class="em-font-Roboto-Regular">
    <style type="text/css">
        html {
            -webkit-text-size-adjust: none;
            -ms-text-size-adjust: none;
        }
    </style>
    <style em="styles">
        .em-font-Roboto-Bold,
        .em-font-Roboto-Regular {
            font-family: "Roboto", sans-serif !important;
            font-weight: 700 !important;
        }


        .em-font-Roboto-Regular {
            font-weight: 400 !important;
        }

        @media only screen and (max-device-width:660px),
        only screen and (max-width:660px) {
            .em-narrow-table {
                width: 100% !important;
                max-width: 660px !important;
                min-width: 320px !important;
            }

            .em-mob-wrap.em-mob-wrap-cancel {
                display: table-cell !important;
            }

            .em-mob-width-auto {
                width: auto !important;
            }

            .em-mob-wrap {
                display: block !important;
            }

            .em-mob-width-100perc {
                width: 100% !important;
                max-width: 100% !important;
            }

            .em-mob-padding_right-20 {
                padding-right: 20px !important;
            }

            .em-mob-padding_left-20 {
                padding-left: 20px !important;
            }
        }
    </style>
</head>

<body style="margin: 0px; padding: 0px; background-color: #101010;">
    <span class="preheader"
        style="visibility: hidden; opacity: 0; color: #101010; height: 0px; width: 0px; font-size: 1px; display: none !important;">&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;</span>
    <!--[if !mso]><!-->
    <div style="font-size:0px;color:transparent;opacity:0;">
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    </div>
    <!--<![endif]-->
    <table cellpadding="0" cellspacing="0" border="0" width="100%"
        style="font-size: 1px; line-height: normal; background-color: #101010;" bgcolor="#101010">
        <tr em="group">
            <td align="center" style="padding-top: 42px; padding-bottom: 42px;">
                <!--[if (gte mso 9)|(IE)]>
				<table cellpadding="0" cellspacing="0" border="0" width="660"><tr><td>
				<![endif]-->
                <table cellpadding="0" cellspacing="0" width="100%" border="0"
                    style="max-width: 660px; min-width: 660px; width: 660px;" class="em-narrow-table">
                    <tr em="block" class="em-structure">
                        <td align="center"
                            style="padding: 32px 48px 20px; background-color: #171717; border-top-left-radius: 32px; border-top-right-radius: 32px; border-bottom-left-radius: 0px;"
                            bgcolor="#171717" class="em-mob-padding_left-20 em-mob-padding_right-20">
                            <table border="0" cellspacing="0" cellpadding="0" class="em-mob-width-100perc">
                                <tr>
                                    <td width="564" class="em-mob-wrap em-mob-wrap-cancel em-mob-width-auto">
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%" em="atom">
                                            <tr>
                                                <td align="center">
                                                    <img width="158" border="0" alt=""
                                                        style="display: block; width: 100%; max-width: 158px; border-radius: 5px;"
                                                        src="https://emcdn.ru/1454730/250930_15546_eh7InZi.png">
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr em="block" class="em-structure">
                        <td align="center"
                            style="padding-right: 48px; padding-bottom: 24px; padding-left: 48px; background-color: #171717;"
                            class="em-mob-padding_left-20 em-mob-padding_right-20" bgcolor="#171717">
                            <table align="center" border="0" cellspacing="0" cellpadding="0"
                                class="em-mob-width-100perc">
                                <tr>
                                    <td width="564" valign="top" class="em-mob-wrap em-mob-width-100perc">
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%"
                                            class="em-mob-width-100perc" em="atom">
                                            <tr>
                                                <td height="0"
                                                    style="padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top: 1px solid #232323;">
                                                    &nbsp;</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr em="block" class="em-structure">
                        <td align="center" style="padding-right: 48px; padding-left: 48px; background-color: #171717;"
                            class="em-mob-padding_left-20 em-mob-padding_right-20" bgcolor="#171717 ">
                            <table align="center" border="0" cellspacing="0" cellpadding="0"
                                class="em-mob-width-100perc">
                                <tr>
                                    <td width="564" valign="top" class="em-mob-wrap em-mob-width-100perc">
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%"
                                            class="em-mob-width-100perc" em="atom">
                                            <tr>
                                                <td style="padding-right: 0px; padding-left: 0px;">
                                                    <div style="font-family: Helvetica, Arial, sans-serif; font-size: 20px; line-height: 32px; color: #FFFFFF"
                                                        class="em-font-Roboto-Regular"><strong>Восстановление пароля</strong></div>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </table>
                                                                                                </td>
                                                                                            </tr>
                                                                                        </table>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr em="block" class="em-structure">
                                                                                    <td align="center" style="padding: 24px 48px; background-color: #171717;"
                                                                                        class="em-mob-padding_left-20 em-mob-padding_right-20" bgcolor="#171717">
                                                                                        <table align="center" border="0" cellspacing="0" cellpadding="0"
                                                                                            class="em-mob-width-100perc">
                                                                                            <tr>
                                                                                                <td width="596" valign="top" class="em-mob-wrap em-mob-width-100perc">
                                                                                                    <table cellpadding="0" cellspacing="0" border="0" width="100%"
                                                                                                        class="em-mob-width-100perc" em="atom">
                                                                                                        <tr>
                                                                <td>
                                                                    <div style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; line-height: 21px; color: #989795;"
                                                                        class="em-font-Roboto-Regular">
                                                                        Здравствуйте!<br><br>Вы запросили восстановление пароля. Для смены пароля перейдите по ссылке ниже:<br><br>
                                                                        <a href="${link}" style="color: #E85102; text-decoration: none; font-weight: bold;">${link}</a><br><br> 
                                                                        * Ссылка будет действительна в течение 30 минут.
                                                                    </div>
                                                                </td>
                                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr em="block" class="em-structure">
                        <td align="center"
                            style="padding-right: 48px; padding-bottom: 24px; padding-left: 48px; background-color: #171717;"
                            class="em-mob-padding_left-20 em-mob-padding_right-20" bgcolor="#171717">
                            <table align="center" border="0" cellspacing="0" cellpadding="0"
                                class="em-mob-width-100perc">
                                <tr>
                                    <td width="564" valign="top" class="em-mob-wrap em-mob-width-100perc">
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%"
                                            class="em-mob-width-100perc" em="atom">
                                            <tr>
                                                <td style="padding-right: 0px; padding-left: 0px;">
                                                    <table cellpadding="0" cellspacing="0" border="0"
                                                        class="em-mob-width-100perc" width="254" style="width: 254px;">
                                                        <tr>
                                                            <td align="center" valign="middle"
                                                                style="background-color: #e85102; height: 54px; border-radius: 16px;"
                                                                height="54" bgcolor="#E85102">
                                                                <a href="${link}" target="_blank"
                                                                    style="display: block; font-family: Helvetica, Arial, sans-serif; color: #ffffff; font-size: 16px; text-decoration: none; white-space: nowrap; height: 54px; line-height: 54px;"
                                                                    class="em-font-Roboto-Bold">
                                                                    Восстановить пароль
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr em="block" class="em-structure">
                        <td align="center"
                            style="padding-right: 48px; padding-left: 48px; background-color: #171717; padding-bottom: 32px; border-radius: 0px 0px 32px 32px;"
                            class="em-mob-padding_left-20 em-mob-padding_right-20" bgcolor="#171717">
                            <table align="center" border="0" cellspacing="0" cellpadding="0"
                                class="em-mob-width-100perc">
                                <tr>
                                    <td width="564" valign="top" class="em-mob-wrap em-mob-width-100perc">
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%"
                                            class="em-mob-width-100perc" em="atom">
                                            <tr>
                                                <td>
                                                    <div style="font-family: Helvetica, Arial, sans-serif; font-size: 16px; line-height: 21px; color: #989795"
                                                        class="em-font-Roboto-Regular">Если у вас возникнут вопросы или
                                                        потребуется помощь, дайте нам знать: <a href="mailto:help@landix.group" target="_blank" style="color: #989795; text-decoration: none;">help@landix.group</a>.<br><br>С
                                                        уважением, Команда&nbsp;LANDIX GROUP</div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <!--[if (gte mso 9)|(IE)]>
				</td></tr></table>
				<![endif]-->
            </td>
        </tr>
    </table>
</body>

</html>`;
};
