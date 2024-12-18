import { Detail, Form, ActionPanel, Action, useNavigation } from "@raycast/api";
import { useState } from "react";

export default function Command() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const { pop } = useNavigation();

  const fetchBalance = async (address: string) => {
    try {
      // Add your API call here to fetch balance
      // const balanceResponse = await fetch(`YOUR_API_ENDPOINT/balance/${address}`);
      // const balance = await balanceResponse.json();
      // setBalance(balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const renderContent = () => {
    if (!address) {
      return "# Please enter an address";
    }

    return `
# Address Balance ${address}

${balance ?? "Loading..."}
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