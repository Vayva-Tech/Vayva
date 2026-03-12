import * as React from "react";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";
import { IconBox } from "../components/icons";

export function LowStockAlertEmail(props: {
  storeName: string;
  products: Array<{ name: string; remaining: number }>;
  inventoryUrl: string;
}) {
  return (
    <VayvaGlowLayout
      preheader="Low stock alert"
      headline="Some products are running low"
      body={
        <>
          The following products in{" "}
          <strong style={{ color: "#E8FFF2" }}>{props.storeName}</strong> are
          running low on stock and may sell out soon:
        </>
      }
      calloutIcon={<IconBox />}
      calloutTitle={`${props.products.length} product${props.products.length === 1 ? "" : "s"} low`}
      calloutText={
        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          style={{ width: "100%" }}
        >
          <tbody>
            {props.products.slice(0, 5).map((p, i) => (
              <tr key={i}>
                <td
                  style={{
                    fontFamily:
                      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                    fontSize: 13,
                    color: "#E8FFF2",
                    padding: "3px 0",
                  }}
                >
                  {p.name}
                </td>
                <td
                  align="right"
                  style={{
                    fontFamily:
                      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                    fontSize: 13,
                    fontWeight: 800,
                    color: p.remaining <= 3 ? "#F87171" : "#FBBF24",
                    padding: "3px 0",
                  }}
                >
                  {p.remaining} left
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
      ctaText="Manage inventory"
      ctaUrl={props.inventoryUrl}
      footerNote={
        <>
          You can adjust low-stock thresholds in your store settings.
          <br />
          Need help? Contact{" "}
          <span style={{ color: "#E8FFF2" }}>support@vayva.ng</span>.
        </>
      }
    />
  );
}
