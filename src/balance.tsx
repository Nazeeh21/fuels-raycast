import { Action, ActionPanel, Detail, Form, useNavigation } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useRef, useState } from "react";
import { getFuelUrl } from "./lib/utils";
import { BALANCE_QUERY } from "./queries";
import fetch from "node-fetch";

interface BalanceItem {
  amount: string;
  assetId: string;
}

export default function Command() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { pop } = useNavigation();

  const baseAssetId = "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07";

  const fetchBalance = async (address: string) => {
    try {
      setIsLoading(true);

      const response = await fetch(getFuelUrl("testnet"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: BALANCE_QUERY,
          variables: {
            filter: {
              owner: address,
            },
          },
        }),
      });

      console.log("response: ", response);
      const data = await response.json();
      console.log("data: ", data);
      const balances = data.data.balances.nodes;
      setBalance(JSON.stringify(balances, null, 2));
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (!address) {
      return "# Please enter an address";
    }

    const formatBalance = (balanceData: BalanceItem[]) => {
      return balanceData
        .map((item) => {
          const amount = Number(item.amount) / 1e9;
          const isBaseAsset = item.assetId.toLowerCase() === baseAssetId.toLowerCase();
          return `
- **Amount:** ${amount.toLocaleString(undefined, { minimumFractionDigits: 9, maximumFractionDigits: 9 })}${isBaseAsset ? " ETH" : ""}
  **Asset ID:** \`${item.assetId}\`
`;
        })
        .join("\n");
    };

    return `
# Address Balance

**Address:** \`${address}\`

${isLoading ? "Loading..." : balance ? formatBalance(JSON.parse(balance)) : "No balance found"}
    `;
  };

  return (
    <Detail
      markdown={renderContent()}
      actions={
        <ActionPanel>
          <Action.Push
            title="Enter Address"
            target={
              <Form
                actions={
                  <ActionPanel>
                    <Action.SubmitForm
                      title="Submit"
                      onSubmit={({ addressInput }) => {
                        setAddress(addressInput);
                        fetchBalance(addressInput);
                        pop();
                      }}
                    />
                  </ActionPanel>
                }
              >
                <Form.TextField id="addressInput" title="Address" placeholder="Enter address" />
              </Form>
            }
          />
        </ActionPanel>
      }
    />
  );
}
