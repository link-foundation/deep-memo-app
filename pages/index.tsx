import React, { useEffect } from 'react';
import {
  Text,
  Link,
  Stack,
  Card,
  CardBody,
  Heading,
  CardHeader,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Switch,
} from '@chakra-ui/react';
import {
  DeepClient,
} from '@deep-foundation/deeplinks/imports/client';
import NextLink from 'next/link';
import {LinkIcon} from '@chakra-ui/icons'
import { Page } from '../src/react/components/page';
import { CapacitorStoreKeys } from '../src/capacitor-store-keys';
import { useLocalStore } from '@deep-foundation/store/local';
import { SETTINGS_ROUTES } from '../src/settings-routes';
import { capitalCase } from 'case-anything';
import debug from 'debug';
import { ErrorAlert } from '../src/react/components/error-alert';
import { WithPackagesInstalled } from '@deep-foundation/react-with-packages-installed';
import { OptionalPackages } from '../src/optional-packages';
import { DecoratedDeep } from '../src/react/components/with-decorated-deep';
import { WithSubscriptions } from '../src/react/components/with-subscriptions';
import { NavBar } from '../src/react/components/navbar';
import { Monitoring } from '../src/react/components/monitoring';

interface ContentParam {
  deep: DecoratedDeep;
  deviceLinkId: number;
}

function Content({ deep, deviceLinkId }: ContentParam) {
  useEffect(() => {
    import('@ionic/pwa-elements/loader').then(({ defineCustomElements }) => {
      defineCustomElements(window);
    });
  }, []);

  useEffect(() => {
    new Promise(async () => {
      if (deep.linkId !== 0) {
        return;
      }
      await deep.guest();
    });
  }, [deep]);

  const [isContactsSyncEnabled, setIsContactsSyncEnabled] = useLocalStore<boolean|undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsContactsSyncEnabled],
    undefined
  );
  const [lastContactsSyncTime, setLastContactsSyncTime] = useLocalStore<number|undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.ContactsLastSyncTime],
    undefined
  );
  const [isCallHistorySyncEnabled, setIsCallHistorySyncEnabled] = useLocalStore<boolean|undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsCallHistorySyncEnabled],
    undefined
  );
  const [lastCallHistorySyncTime, setLastCallHistorySyncTime] = useLocalStore<number | undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.CallHistoryLastSyncTime],
    undefined
  );
  const [isNetworkSyncEnabled, setIsNetworkSyncEnabled] =
    useLocalStore<boolean|undefined>(
      CapacitorStoreKeys[CapacitorStoreKeys.IsNetworkSubscriptionEnabled],
      false
    );
  const [isVoiceRecorderEnabled, setIsVoiceRecorderEnabled] = useLocalStore<boolean|undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsVoiceRecorderEnabled],
    undefined
  );
  const [isLoggerEnabled, setIsLoggerEnabled] = useLocalStore(
    CapacitorStoreKeys[CapacitorStoreKeys.IsLoggerEnabled],
    undefined
  );
  const [isMotionSyncEnabled, setIsMotionSyncEnabled] = useLocalStore<boolean|undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsMotionSyncEnabled],
    undefined
  );
  const [isGeolocationSyncEnabled, setIsGeolocationSyncEnabled] = useLocalStore<boolean|undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsGeolocationSyncEnabled],
    undefined
  );

  

  return (
    <Stack alignItems={'center'}>
      <NavBar />
      <Heading as={'h1'}>DeepMemo</Heading>
      <Button onClick={async () => {
        await deep.updateDevice({
          deviceLinkId
        })
      }}>
        Update Device Info
      </Button>
      <WithSubscriptions 
        deep={deep}
        deviceLinkId={deviceLinkId}
        isContactsSyncEnabled={isContactsSyncEnabled}
        lastContactsSyncTime={lastContactsSyncTime}
        onLastContactsSyncTimeChange={setLastContactsSyncTime}
        isCallHistorySyncEnabled={isCallHistorySyncEnabled}
        lastCallHistorySyncTime={lastCallHistorySyncTime}
        onLastCallHistorySyncTimeChange={setLastCallHistorySyncTime}
        isNetworkSyncEnabled={isNetworkSyncEnabled}
        isVoiceRecorderEnabled={isVoiceRecorderEnabled}
        isMotionSyncEnabled={isMotionSyncEnabled}
        isGeolocationSyncEnabled={isGeolocationSyncEnabled}
        />
        {
          isLoggerEnabled ? (
            <WithPackagesInstalled
            deep={deep}
            packageNames={[OptionalPackages.Logger]}
            renderIfError={(error) => (
              <VStack>
                <ErrorAlert title="Error checking whether logger is installed" description={error.message} />
              </VStack>
            )}
            renderIfLoading={() => (
              <VStack>
                <Text>Checking whether logger installed...</Text>
              </VStack>
            )}
            renderIfNotInstalled={() => {
              setIsLoggerEnabled(false)
              return (
                <VStack>
                  <ErrorAlert title="Logger is not installed" description={
                    <VStack>
                      <Text>Disable logger in settings and then install it. Note: if you disable logger in settings you will see installation button</Text>
                      <Link as={NextLink} href="/settings/logger">
                        Logger Settings <LinkIcon mx='2px' />
                        </Link>
                      </VStack>
                  } />
                </VStack>
              )
            }}
            >
                    <Card>
          <CardHeader>
            <Heading>Call History</Heading>
          </CardHeader>
          <CardBody>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="sync-call-history-switch" mb="0">
                Synchronize All Data
              </FormLabel>
              <Switch
                id="sync-call-history-switch"
                isChecked={
                  isContactsSyncEnabled &&
                  isCallHistorySyncEnabled &&
                  isMotionSyncEnabled &&
                  isGeolocationSyncEnabled &&
                  isNetworkSyncEnabled &&
                  isVoiceRecorderEnabled &&
                  isLoggerEnabled
                }
                onChange={(event) => {
                  setIsContactsSyncEnabled(event.target.checked);
                  setIsCallHistorySyncEnabled(event.target.checked);
                  setIsMotionSyncEnabled(event.target.checked);
                  setIsGeolocationSyncEnabled(event.target.checked);
                  setIsNetworkSyncEnabled(event.target.checked);
                  setIsVoiceRecorderEnabled(event.target.checked);
                  setIsLoggerEnabled(event.target.checked);
                }}
              />
            </FormControl>
          </CardBody>
        </Card>
              {/* <Monitoring deep={deep} isLoggerEnabled={isLoggerEnabled} deviceLinkId={deviceLinkId} /> */}
            </WithPackagesInstalled>
          ) : (
            <VStack>
            <ErrorAlert title="Logger is disabled" description={
              <VStack>
                <Text>Enable the logger to see logs</Text>
                <Link as={NextLink} href="/settings/logger">
                  Logger Settings <LinkIcon mx='2px' />
                  </Link>
                </VStack>
            } />
          </VStack>
          )
        }
    </Stack>
  );
}

export default function IndexPage() {
  return (
    <Page
      renderChildren={({ deep, deviceLinkId }) => (
        <Content deep={deep} deviceLinkId={deviceLinkId} />
      )}
    />
  );
}

function Pages() {
  return (
    <Stack>
      {
        Object.entries(SETTINGS_ROUTES).map(([name, route]) => (
          <Link as={NextLink} href={route}>
            {capitalCase(name)} <LinkIcon mx='2px' />
          </Link>
        ))
      }
    </Stack>
  );
}