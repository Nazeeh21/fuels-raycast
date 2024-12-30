import { ActionPanel, Action, List, Form, showToast, Toast, getPreferenceValues, open } from "@raycast/api";
import { FuelAgent } from "fuel-agent-kit";
import { useState } from "react";
import nodeFetch from 'node-fetch';

// Polyfill fetch
if (!global.fetch) {
  (global as unknown as any).fetch = nodeFetch;
}

interface Operation {
  title: string;
  description: string;
  form: () => JSX.Element;
}

export default function Command() {
  const [showForm, setShowForm] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [commandInput, setCommandInput] = useState<string>("");
  const [transactionLink, setTransactionLink] = useState<string | null>(null);
  const preferences = getPreferenceValues();

  const agent = new FuelAgent({
    openAiApiKey: preferences.openaiApiKey,
    walletPrivateKey: preferences.fuelWalletPrivateKey,
    model: "gpt-4o",
  });
  
  const operations: Record<string, Operation> = {
    naturalLanguage: {
      title: "Execute Natural Language Command",
      description: "Enter a command in natural language",
      form: () => (
        <Form
          actions={
            <ActionPanel>
              <Action.SubmitForm
                title="Execute Command"
                onSubmit={async (values) => {
                  const toast = await showToast(Toast.Style.Animated, "Executing Command...");
                  try {
                    const response = await agent.execute(values.command);
                    console.log("Command response:", response);

                    // Extract the transaction link from the response
                    const link = response.output.match(/https?:\/\/[^\s]+/)[0];
                    setTransactionLink(link);

                    toast.style = Toast.Style.Success;
                    toast.title = "Command executed successfully!";
                    toast.message = `Transaction link: ${link}`;

                    // Open the link in the user's browser
                    // await open(link);
                  } catch (error) {
                    console.error("Command error:", error);
                    toast.style = Toast.Style.Failure;
                    toast.title = "Command execution failed";
                    toast.message = String(error);
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            </ActionPanel>
          }
        >
          <Form.TextArea id="command" title="Command" placeholder="Send 0.1 USDC to 0x..." />
        </Form>
      ),
    },
    transfer: {
      title: "Transfer Funds",
      description: "Send tokens to another address",
      form: () => (
        <Form
          actions={
            <ActionPanel>
              <Action.SubmitForm
                title="Execute Transfer"
                onSubmit={async (values) => {
                  setLoading(true);
                  const toast = await showToast(Toast.Style.Animated, "Executing Transfer...");
                  try {
                    const response = await agent.transfer({
                      to: values.address,
                      amount: values.amount,
                      symbol: values.symbol,
                    });

                    console.log("Transfer response:", response);
                    toast.style = Toast.Style.Success;
                    toast.title = "Transfer successful!";
                  } catch (error) {
                    console.error("Transfer error:", error);
                    toast.style = Toast.Style.Failure;
                    toast.title = "Transfer failed";
                    toast.message = String(error);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              />
            </ActionPanel>
          }
        >
          <Form.TextField id="address" title="Recipient Address" placeholder="0x..." disabled={loading} />
          <Form.TextField id="amount" title="Amount" placeholder="0.1" disabled={loading} />
          <Form.TextField id="symbol" title="Token Symbol" placeholder="USDC" disabled={loading} />
        </Form>
      ),
    },
    swap: {
      title: "Swap Assets",
      description: "Swap between different tokens",
      form: () => (
        <Form
          actions={
            <ActionPanel>
              <Action.SubmitForm
                title="Execute Swap"
                onSubmit={async (values) => {
                  setLoading(true);
                  const toast = await showToast(Toast.Style.Animated, "Executing Swap...");
                  try {
                    const response = await agent.swapExactInput({
                      fromSymbol: values.fromSymbol,
                      amount: values.amount,
                      toSymbol: values.toSymbol,
                    });
                    console.log("Swap response:", response);
                    toast.style = Toast.Style.Success;
                    toast.title = "Swap successful!";
                  } catch (error) {
                    console.error("Swap error:", error);
                    toast.style = Toast.Style.Failure;
                    toast.title = "Swap failed";
                    toast.message = String(error);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                
              />
            </ActionPanel>
          }
        >
          <Form.TextField id="fromSymbol" title="From Token" placeholder="USDC" disabled={loading} />
          <Form.TextField id="amount" title="Amount" placeholder="100" disabled={loading} />
          <Form.TextField id="toSymbol" title="To Token" placeholder="ETH" disabled={loading} />
        </Form>
      ),
    },
    liquidity: {
      title: "Provide Liquidity",
      description: "Add liquidity to a pool",
      form: () => (
        <Form
          actions={
            <ActionPanel>
              <Action.SubmitForm
                title="Add Liquidity"
                onSubmit={async (values) => {
                  const toast = await showToast(Toast.Style.Animated, "Adding Liquidity...");
                  try {
                    const response = await agent.addLiquidity({
                      amount0: values.amount0,
                      asset0Symbol: values.asset0Symbol,
                      asset1Symbol: values.asset1Symbol,
                    });
                    console.log("Liquidity response:", response);
                    toast.style = Toast.Style.Success;
                    toast.title = "Liquidity added successfully!";
                  } catch (error) {
                    console.error("Liquidity error:", error);
                    toast.style = Toast.Style.Failure;
                    toast.title = "Failed to add liquidity";
                    toast.message = String(error);
                  }
                }}
              />
            </ActionPanel>
          }
        >
          <Form.TextField id="amount0" title="Amount" placeholder="100" />
          <Form.TextField id="asset0Symbol" title="First Asset" placeholder="USDC" />
          <Form.TextField id="asset1Symbol" title="Second Asset" placeholder="ETH" />
        </Form>
      ),
    },
    collateral: {
      title: "Supply Collateral",
      description: "Supply tokens as collateral",
      form: () => (
        <Form
          actions={
            <ActionPanel>
              <Action.SubmitForm
                title="Supply Collateral"
                onSubmit={async (values) => {
                  const toast = await showToast(Toast.Style.Animated, "Supplying Collateral...");
                  try {
                    const response = await agent.supplyCollateral({
                      amount: values.amount,
                      symbol: values.symbol,
                    });
                    console.log("Collateral response:", response);
                    toast.style = Toast.Style.Success;
                    toast.title = "Collateral supplied successfully!";
                  } catch (error) {
                    console.error("Collateral error:", error);
                    toast.style = Toast.Style.Failure;
                    toast.title = "Failed to supply collateral";
                    toast.message = String(error);
                  }
                }}
              />
            </ActionPanel>
          }
        >
          <Form.TextField id="amount" title="Amount" placeholder="100" />
          <Form.TextField id="symbol" title="Token Symbol" placeholder="USDC" />
        </Form>
      ),
    },
    borrow: {
      title: "Borrow Asset",
      description: "Borrow USDC against your collateral",
      form: () => (
        <Form
          actions={
            <ActionPanel>
              <Action.SubmitForm
                title="Borrow Asset"
                onSubmit={async (values) => {
                  const toast = await showToast(Toast.Style.Animated, "Borrowing Asset...");
                  try {
                    const response = await agent.borrowAsset({
                      amount: values.amount,
                    });
                    console.log("Borrow response:", response);
                    toast.style = Toast.Style.Success;
                    toast.title = "Asset borrowed successfully!";
                  } catch (error) {
                    console.error("Borrow error:", error);
                    toast.style = Toast.Style.Failure;
                    toast.title = "Failed to borrow asset";
                    toast.message = String(error);
                  }
                }}
              />
            </ActionPanel>
          }
        >
          <Form.TextField id="amount" title="Amount" placeholder="100" />
        </Form>
      ),
    },
  };

  const handleExecuteCommand = async () => {
    if (!commandInput) return;
    setLoading(true);
    const toast = await showToast(Toast.Style.Animated, "Executing Command...");
    try {
      const response = await agent.execute(commandInput);
      console.log("Command response:", response);

      // Extract the transaction link from the response
      const link = response.output.match(/https?:\/\/[^\s]+/)[0];
      setTransactionLink(link);

      toast.style = Toast.Style.Success;
      toast.title = "Command executed successfully!";
      toast.message = `Transaction link: ${link}`;
    } catch (error) {
      console.error("Command error:", error);
      toast.style = Toast.Style.Failure;
      toast.title = "Command execution failed";
      toast.message = String(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showForm ? (
        operations[showForm].form()
      ) : (
        <List>
          {/* <List.Item
            title="Execute Natural Language Command"
            subtitle="Enter a command in natural language"
            actions={
              <ActionPanel>
                <Action
                  title="Execute Command"
                  onAction={handleExecuteCommand}
                  disabled={loading || !commandInput}
                />
              </ActionPanel>
            }
          /> */}
          <Form.TextArea
            id="commandInput"
            title="Command"
            placeholder="Send 0.0001 ETH to 0x..."
            value={commandInput}
            onChange={setCommandInput}
            disabled={loading}
          />
          {transactionLink && (
            <List.Item
              title="Transaction Link"
              subtitle={transactionLink}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser url={transactionLink} />
                </ActionPanel>
              }
            />
          )}
          {Object.entries(operations).map(([key, op]) => (
            <List.Item
              key={key}
              title={op.title}
              subtitle={op.description}
              actions={
                <ActionPanel>
                  <Action title={`Open ${op.title} Form`} onAction={() => setShowForm(key)} />
                </ActionPanel>
              }
            />
          ))}
        </List>
      )}
    </>
  );
}
