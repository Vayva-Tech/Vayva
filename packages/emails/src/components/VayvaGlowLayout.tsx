import * as React from "react";

type Props = {
  preheader: string;
  headline: string;
  body: React.ReactNode;
  calloutIcon: React.ReactNode;
  calloutTitle: string;
  calloutText: React.ReactNode;
  ctaText: string;
  ctaUrl: string;
  footerNote?: React.ReactNode;
};

export function VayvaGlowLayout(props: Props) {
  const year = new Date().getFullYear();

  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Vayva</title>
      </head>

      <body style={{ margin: 0, padding: 0, backgroundColor: "#07120C" }}>
        {/* Preheader (hidden) */}
        <div style={{ display: "none", maxHeight: 0, overflow: "hidden", opacity: 0, color: "transparent" }}>
          {props.preheader}
        </div>

        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}
          style={{ backgroundColor: "#07120C", padding: "28px 12px" }}>
          <tbody>
            <tr>
              <td align="center">
                <table role="presentation" width="600" cellPadding={0} cellSpacing={0}
                  style={{ maxWidth: 600, width: "100%" }}>
                  <tbody>
                    {/* Brand Row */}
                    <tr>
                      <td style={{ padding: "6px 4px 14px 4px" }}>
                        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              <td style={{ verticalAlign: "middle" }}>
                                <img
                                  src="https://vayva.ng/logos/brand-logo.png"
                                  width={40}
                                  height={40}
                                  alt="Vayva"
                                  style={{
                                    display: "inline-block",
                                    verticalAlign: "middle",
                                    border: 0,
                                    outline: "none",
                                    textDecoration: "none",
                                    borderRadius: 12,
                                  }}
                                />
                                <span
                                  style={{
                                    display: "inline-block",
                                    verticalAlign: "middle",
                                    marginLeft: 10,
                                    fontFamily:
                                      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                    fontWeight: 800,
                                    fontSize: 18,
                                    color: "#E8FFF2",
                                    letterSpacing: "-0.02em",
                                  }}
                                >
                                  Vayva
                                </span>
                              </td>
                              <td align="right" style={{ verticalAlign: "middle" }}>
                                <span
                                  style={{
                                    fontFamily:
                                      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                    fontSize: 12,
                                    color: "#A7F3C6",
                                  }}
                                >
                                  {props.preheader}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Glow wrapper */}
                    <tr>
                      <td style={{ paddingBottom: 14 }}>
                        <table
                          role="presentation"
                          width="100%"
                          cellPadding={0}
                          cellSpacing={0}
                          style={{
                            backgroundColor: "#051009",
                            borderRadius: 20,
                            border: "1px solid #0E3B22",
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ padding: 2 }}>
                                <table
                                  role="presentation"
                                  width="100%"
                                  cellPadding={0}
                                  cellSpacing={0}
                                  style={{
                                    backgroundColor: "#07150D",
                                    borderRadius: 18,
                                    border: "1px solid #0F5C33",
                                  }}
                                >
                                  <tbody>
                                    <tr>
                                      <td>
                                        <div
                                          style={{
                                            height: 8,
                                            backgroundColor: "#22C55E",
                                            borderRadius: "18px 18px 0 0",
                                          }}
                                        />
                                        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
                                          <tbody>
                                            <tr>
                                              <td style={{ padding: "24px 24px 20px 24px" }}>
                                                <div
                                                  style={{
                                                    fontFamily:
                                                      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                                    fontSize: 22,
                                                    fontWeight: 900,
                                                    letterSpacing: "-0.02em",
                                                    color: "#E8FFF2",
                                                    margin: "0 0 8px 0",
                                                  }}
                                                >
                                                  {props.headline}
                                                </div>

                                                <div
                                                  style={{
                                                    fontFamily:
                                                      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                                    fontSize: 15,
                                                    lineHeight: 1.65,
                                                    color: "#CFFFE1",
                                                    margin: "0 0 18px 0",
                                                  }}
                                                >
                                                  {props.body}
                                                </div>

                                                <table
                                                  role="presentation"
                                                  width="100%"
                                                  cellPadding={0}
                                                  cellSpacing={0}
                                                  style={{
                                                    backgroundColor: "#071A10",
                                                    border: "1px solid #14532D",
                                                    borderRadius: 16,
                                                  }}
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td style={{ padding: 14 }}>
                                                        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
                                                          <tbody>
                                                            <tr>
                                                              <td width={28} style={{ verticalAlign: "top" }}>
                                                                {props.calloutIcon}
                                                              </td>
                                                              <td style={{ paddingLeft: 10, verticalAlign: "top" }}>
                                                                <div
                                                                  style={{
                                                                    fontFamily:
                                                                      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                                                    fontSize: 14,
                                                                    lineHeight: 1.5,
                                                                    color: "#E8FFF2",
                                                                    fontWeight: 800,
                                                                    margin: "0 0 2px 0",
                                                                  }}
                                                                >
                                                                  {props.calloutTitle}
                                                                </div>
                                                                <div
                                                                  style={{
                                                                    fontFamily:
                                                                      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                                                    fontSize: 13,
                                                                    lineHeight: 1.6,
                                                                    color: "#BFFFD6",
                                                                    margin: 0,
                                                                  }}
                                                                >
                                                                  {props.calloutText}
                                                                </div>
                                                              </td>
                                                            </tr>
                                                          </tbody>
                                                        </table>
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>

                                                <div style={{ height: 16 }} />

                                                <table role="presentation" cellPadding={0} cellSpacing={0}>
                                                  <tbody>
                                                    <tr>
                                                      <td style={{ backgroundColor: "#22C55E", borderRadius: 14 }}>
                                                        <a
                                                          href={props.ctaUrl}
                                                          style={{
                                                            display: "inline-block",
                                                            padding: "12px 16px",
                                                            fontFamily:
                                                              "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                                            fontSize: 14,
                                                            fontWeight: 800,
                                                            color: "#05210F",
                                                            textDecoration: "none",
                                                            borderRadius: 14,
                                                          }}
                                                        >
                                                          {props.ctaText}
                                                        </a>
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>

                                                <div
                                                  style={{
                                                    fontFamily:
                                                      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                                    fontSize: 12,
                                                    lineHeight: 1.6,
                                                    color: "#A7F3C6",
                                                    marginTop: 12,
                                                  }}
                                                >
                                                  If the button doesn’t work, copy and paste this link:
                                                  <br />
                                                  <span style={{ color: "#E8FFF2", wordBreak: "break-all" }}>
                                                    {props.ctaUrl}
                                                  </span>
                                                </div>

                                                <div style={{ height: 1, backgroundColor: "#0F5C33", margin: "18px 0" }} />

                                                <div
                                                  style={{
                                                    fontFamily:
                                                      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                                    fontSize: 12,
                                                    lineHeight: 1.6,
                                                    color: "#A7F3C6",
                                                  }}
                                                >
                                                  {props.footerNote ?? (
                                                    <>
                                                      Need help? Reply to this email or contact{" "}
                                                      <span style={{ color: "#E8FFF2" }}>support@vayva.ng</span>.
                                                    </>
                                                  )}
                                                </div>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Legal footer */}
                    <tr>
                      <td style={{ padding: "0 6px" }}>
                        <div
                          style={{
                            fontFamily:
                              "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                            fontSize: 11,
                            lineHeight: 1.6,
                            color: "#6EE7A1",
                            textAlign: "center",
                          }}
                        >
                          © {year} Vayva. All rights reserved.
                          <br />
                          Lagos, Nigeria
                        </div>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
