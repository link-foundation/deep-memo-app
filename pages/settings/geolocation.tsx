import {
  Card,
  CardBody,
  CardHeader,
  ChakraProvider,
  FormControl,
  FormLabel,
  Heading,
  Switch,
} from '@chakra-ui/react';
import { DeepClient, DeepProvider } from '@deep-foundation/deeplinks/imports/client';
import { useLocalStore } from '@deep-foundation/store/local';
import { Provider } from '../../imports/provider';
import { CapacitorStoreKeys } from '../../imports/capacitor-store-keys';
import { Page } from '../../components/page';
import { SettingContent } from '../../components/setting-page';

function Content() {
  const [isGeolocationSyncEnabled, setIsGeolocationSyncEnabled] = useLocalStore(
    CapacitorStoreKeys[CapacitorStoreKeys.IsGeolocationSyncEnabled],
    undefined
  );

  return (
    <Card>
          <CardHeader>
            <Heading>Geolocation</Heading>
          </CardHeader>
          <CardBody>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="sync-geolocation-switch" mb="0">
                Sync Geolocation
              </FormLabel>
              <Switch
                id="sync-geolocation-switch"
                isChecked={isGeolocationSyncEnabled}
                onChange={(event) => {
                  setIsGeolocationSyncEnabled(event.target.checked);
                }}
              />
            </FormControl>
          </CardBody>
        </Card>
  );
}

export default function GeolocationSettingsPage() {
  return (
    <Page renderChildren={({deep,deviceLinkId}) => <SettingContent>
    <Content/>
  </SettingContent>} />
  );
}