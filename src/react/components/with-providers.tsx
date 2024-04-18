import { ChakraProvider, CircularProgress, Text, VStack } from "@chakra-ui/react";
import { DeepProvider } from "@deep-foundation/deeplinks/imports/client";
import { TokenProvider } from "@deep-foundation/deeplinks/imports/react-token";
import { ApolloClientTokenizedProvider } from "@deep-foundation/react-hasura/apollo-client-tokenized-provider";
import { StoreProvider } from "./store-provider";
import { WithGraphQlUrl } from "./with-graphql-url";
import { WithAddDebugFieldsToWindow } from "./with-add-debug-fields-to-window";

export function WithProviders({ children }: { children: JSX.Element }) {
  return (
    <ChakraProvider>
      <StoreProvider>
        <TokenProvider>
          <WithGraphQlUrl
          renderIfLoading={() => (
            <VStack height="100vh" justifyContent={"center"}>
              <CircularProgress isIndeterminate />
              <Text>Loading GraphQL url...</Text>
            </VStack>
          )}
            renderChildren={({ graphQlUrl }) => (
              <ApolloClientTokenizedProvider
              options={{
                client: "@deep-foundation/deepmemo",
                ...(graphQlUrl && {
                  path:
                    new URL(graphQlUrl).host +
                    new URL(graphQlUrl).pathname +
                    new URL(graphQlUrl).search +
                    new URL(graphQlUrl).hash,
                  ssl: new URL(graphQlUrl).protocol === "https:",
                }),
                ws: !!process?.browser,
              }}
            >
              <DeepProvider>
                  {children}
              </DeepProvider>
            </ApolloClientTokenizedProvider>
            )}
          />
        </TokenProvider>
      </StoreProvider>
    </ChakraProvider>
  );
}
