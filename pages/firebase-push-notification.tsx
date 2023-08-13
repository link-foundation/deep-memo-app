import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TokenProvider } from '@deep-foundation/deeplinks/imports/react-token';
import {
  LocalStoreProvider,
  useLocalStore,
} from '@deep-foundation/store/local';
import {
  DeepClient,
  DeepProvider,
  useDeep,
  useDeepSubscription,
} from '@deep-foundation/deeplinks/imports/client';
import {
  Button,
  ChakraProvider,
  Input,
  Link,
  Stack,
  Text,
  Divider,
  Textarea,
  Code,
  Box,
  RadioGroup,
  Radio,
  Card,
  CardHeader,
  Heading,
  CardBody,
  CardFooter,
  Checkbox,
  StackDivider,
  NumberInputField,
  NumberInput,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  HStack,
  useDisclosure,
} from '@chakra-ui/react';
import { Provider } from '../imports/provider';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Device as CapacitorDevice } from '@capacitor/device';
import {
  getMessaging,
  getToken,
  Messaging,
  onMessage,
} from 'firebase/messaging';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { getNotifyInsertSerialOperations, PushNotificationComponent } from '@deep-foundation/firebase-push-notification';
// import {  } from '@deep-foundation/capacitor-device';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import {
  BatteryInfo,
  Device,
  GetLanguageCodeResult,
  LanguageTag,
} from '@capacitor/device';
import { insertActionSheet } from '../imports/action-sheet/insert-action-sheet';
import { CapacitorPlatform } from '@capacitor/core/types/platforms';
import { Page } from '../components/page';
import validator from '@rjsf/validator-ajv8';
import { RJSFSchema } from '@rjsf/utils';
import Form from '@rjsf/chakra-ui';
import { getPushNotification,  registerDevice, requestPermissions, PushNotificationInfo, checkPermissions, getPushNotificationInsertSerialOperations, getServiceAccountInsertSerialOperations, getWebPushCertificateInsertSerialOperations, getDeviceRegistrationTokenInsertSerialOperations, Package } from '@deep-foundation/firebase-push-notification';
import { PushNotifications } from '@capacitor/push-notifications';
import { CapacitorDevicePackage, getDevice, DeviceInfo } from '@deep-foundation/capacitor-device';
import { DeviceComponent } from '@deep-foundation/capacitor-device';
const schema = require('../imports/firebase-push-notification/schema.json') as RJSFSchema;

export default function PushNotificationsPage() {
  return (
    <Page renderChildren={({deep,deviceLinkId}) => <Content deep={deep} deviceLinkId={deviceLinkId} />} />
  );
}

function Content({deep, deviceLinkId}: {deep: DeepClient, deviceLinkId: number}) {

  const _package = new Package({deep});

  const [deviceRegistrationTokenLinkId, setDeviceRegistrationTokenLinkId] =
    useLocalStore(
      CapacitorStoreKeys[CapacitorStoreKeys.DeviceRegistrationToken],
      undefined
    );

  const [platform, setPlatform] = useState(undefined);

  const [firebaseApplication, setFirebaseApplication] = useState<
    FirebaseApp | undefined
  >(undefined);
  const [firebaseMessaging, setFirebaseMessaging] = useState<
    Messaging | undefined
  >(undefined);

  useEffect(() => {
    if (platform === 'web') {
      const firebaseApplication = initializeApp({
        apiKey: 'AIzaSyAdW-DEUZuYcN-1snWNcL7QvtkNdibT_vY',
        authDomain: 'deep-97e93.firebaseapp.com',
        projectId: 'deep-97e93',
        storageBucket: 'deep-97e93.appspot.com',
        messagingSenderId: '430972811028',
        appId: '1:430972811028:web:7c43130f8166c437c03401',
        measurementId: 'G-NJ1R8HDWLK',
      });
      self['firebaseApplication'] = firebaseApplication;
      setFirebaseApplication(firebaseApplication);

      const firebaseMessaging = getMessaging(firebaseApplication);
      self['firebaseMessaging'] = firebaseMessaging;
      setFirebaseMessaging(firebaseMessaging);
    }
  }, [platform]);

  useEffect(() => {
    new Promise(async () => {
      const deviceInfo = await CapacitorDevice.getInfo();
      setPlatform(deviceInfo.platform);
    });
  }, []);



  const {
    data: pushNotificationLinks,
    loading: isPushNotificationLinksSubscriptionLoading,
    error: pushNotificationLinksSubscriptionError,
  } = useDeepSubscription({
    type_id: {
      _id: [_package.name, 'PushNotification'],
    },
    in: {
      type_id: {
        _id: ['@deep-foundation/core', 'Contain'],
      },
      from_id: deep.linkId,
    },
  });

  type PushNotification = PushNotificationInfo & {linkId: number};
  const [pushNotifications, setPushNotifications] = useState<
  PushNotification[] | undefined
  >(undefined);
  useEffect(() => {
    if (isPushNotificationLinksSubscriptionLoading) {
      return;
    }
    new Promise(async () => {
      const pushNotifications = [];
      for (const pushNotificationLink of pushNotificationLinks) {
        try {
          const pushNotificationInfo = await getPushNotification({
            deep,
            pushNotificationLinkId: pushNotificationLink.id,
          });
          const pushNotification = {
            ...pushNotificationInfo,
            linkId: pushNotificationLink.id,
          }
          pushNotifications.push({
            ...pushNotification,
            linkId: pushNotificationLink.id,
          });
        } catch (error) {
          console.error(error)
          continue;
        }
      }
      setPushNotifications(pushNotifications);
    });
  }, [
    pushNotificationLinks,
    isPushNotificationLinksSubscriptionLoading,
    pushNotificationLinksSubscriptionError,
  ]);

  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  return (
    <Stack
      justifyContent={'center'}
      maxWidth={'768px'}
      margin={[0, 'auto']}
      spacing={4}
    >
      <GeneralInfoCard deep={deep} deviceLinkId={deviceLinkId} deviceRegistrationTokenLinkId={deviceRegistrationTokenLinkId} platform={platform} />
      <PermissionsCard platform={platform} />
      <ServiceAccountInsertionModal deep={deep} deviceLinkId={deviceLinkId} />
      <WebPushCertificateInsertionModal deep={deep} deviceLinkId={deviceLinkId} />
      <DeviceRegistrationCard deep={deep} deviceLinkId={deviceLinkId} firebaseMessaging={firebaseMessaging} platform={platform} onDeviceRegistrationTokenLinkIdChange={setDeviceRegistrationTokenLinkId} />
      <InsertPushNotificationModal deep={deep} deviceLinkId={deviceLinkId} />
      <NotifyInsertionButton deep={deep} pushNotifications={pushNotifications} />
      {/* {notifyInsertionCard} */}
    </Stack>
  );
}

function InsertPushNotificationModal({
  deep,
  deviceLinkId,
}: {
  deep: DeepClient;
  deviceLinkId: number;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button onClick={onOpen}>Insert Push Notification</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxWidth={'fit-content'}>
          <ModalHeader>Insert Push Notification</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Form
              schema={schema}
              validator={validator}
              onSubmit={async (arg) => {
                const {serialOperations} = await getPushNotificationInsertSerialOperations({
                  deep,
                  containerLinkId: deep.linkId,
                  pushNotification: arg.formData,
                });
                await deep.serial({
                  operations: serialOperations,
                })
              }}
            />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function ServiceAccountInsertionModal({
  deep,
  deviceLinkId,
}: {
  deep: DeepClient;
  deviceLinkId: number;
}) {
  enum ServiceAccountObtainingWay {
    File,
    Text,
  }
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [serviceAccountObtainingWay, setServiceAccountObtainingWay] =
    useState<ServiceAccountObtainingWay>(ServiceAccountObtainingWay.File);
  const [serviceAccount, setServiceAccount] = useState<string>('');
  const [shouldMakeServiceAccountActive, setShouldMakeServiceAccountActive] =
    useState<boolean>(true);
  const layoutsByObtainintWays: Record<
    ServiceAccountObtainingWay,
    JSX.Element
  > = {
    [ServiceAccountObtainingWay.File]: (
      <Button
        onClick={async () => {
          const pickFilesResult = await FilePicker.pickFiles({
            types: ['application/json'],
          });
          const {serialOperations} = await getServiceAccountInsertSerialOperations({
            deep,
            serviceAccount: JSON.parse(
              await pickFilesResult.files[0].blob.text()
            ),
            shouldMakeActive: shouldMakeServiceAccountActive,
          });
          await deep.serial({
            operations: serialOperations,
          })
        }}
      >
        Insert Service Account
      </Button>
    ),
    [ServiceAccountObtainingWay.Text]: (
      <>
        <Textarea
          placeholder="Service Account"
          value={serviceAccount}
          onChange={(event) => {
            setServiceAccount(event.target.value);
          }}
        ></Textarea>
        <Button
          onClick={async () => {
            const {serialOperations} = await getServiceAccountInsertSerialOperations({
              deep,
              serviceAccount: JSON.parse(serviceAccount),
              shouldMakeActive: shouldMakeServiceAccountActive,
            });
            await deep.serial({
              operations: serialOperations,
            })
          }}
        >
          Insert Service Account
        </Button>
      </>
    ),
  };
  return (
    <>
      <Button onClick={onOpen}>Insert Service Account</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxWidth={'fit-content'}>
          <ModalHeader>Insert Service Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              <RadioGroup
                onChange={(value) => {
                  setServiceAccountObtainingWay(
                    ServiceAccountObtainingWay[value]
                  );
                }}
                value={ServiceAccountObtainingWay[serviceAccountObtainingWay]}
              >
                <Stack direction="row">
                  <Radio
                    value={
                      ServiceAccountObtainingWay[
                        ServiceAccountObtainingWay.File
                      ]
                    }
                  >
                    File
                  </Radio>
                  <Radio
                    value={
                      ServiceAccountObtainingWay[
                        ServiceAccountObtainingWay.Text
                      ]
                    }
                  >
                    Text
                  </Radio>
                </Stack>
              </RadioGroup>
              <Checkbox
                isChecked={shouldMakeServiceAccountActive}
                onChange={(event) =>
                  setShouldMakeServiceAccountActive(event.target.checked)
                }
              >
                Make Active
              </Checkbox>
              {layoutsByObtainintWays[serviceAccountObtainingWay]}
              <Text>
                Service Account can be found on{' '}
                <Link
                  href={
                    'https://console.firebase.google.com/u/0/project/PROJECT_ID/settings/serviceaccounts/adminsdk'
                  }
                >
                  https://console.firebase.google.com/u/0/project/PROJECT_ID/settings/serviceaccounts/adminsdk
                </Link>
                . Do not forget to change PROJECT_ID in URL to your project id
              </Text>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function WebPushCertificateInsertionModal({
  deep,
  deviceLinkId,
}: {
  deep: DeepClient;
  deviceLinkId: number;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [webPushCertificate, setWebPushCertificate] = useState<string>('');
  const [
    shouldMakeWebPushCertificateActive,
    setShouldMakeWebPushCertificateActive,
  ] = useState<boolean>(true);
  return (
    <>
      <Button onClick={onOpen}>Insert Web Push Certificate</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxWidth={'fit-content'}>
          <ModalHeader>Insert Web Push Certificate</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          <Stack>
          <Input
            placeholder="Web Push Certificate"
            value={webPushCertificate}
            onChange={(event) => {
              setWebPushCertificate(event.target.value);
            }}
          ></Input>
          <Checkbox
            isChecked={shouldMakeWebPushCertificateActive}
            onChange={(event) =>
              setShouldMakeWebPushCertificateActive(event.target.checked)
            }
          >
            Make Active
          </Checkbox>
          <Button
            onClick={async () => {
              const {serialOperations} = await getWebPushCertificateInsertSerialOperations({
                deep,
                webPushCertificate,
                shouldMakeActive: shouldMakeWebPushCertificateActive,
              });
              await deep.serial({
                operations: serialOperations,
              })
            }}
          >
            Insert Web Push Certificate
          </Button>
          <Text>
            WebPushCertificate can be found on{' '}
            <Link
              href={
                'https://console.firebase.google.com/project/PROJECT_ID/settings/cloudmessaging'
              }
            >
              https://console.firebase.google.com/project/PROJECT_ID/settings/cloudmessaging
            </Link>
            . Do not forget to change PROJECT_ID in URL to your project id
          </Text>
          <Text>Required to notificate web clients</Text>
        </Stack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function DeviceRegistrationCard({
  deep,
  deviceLinkId,
  firebaseMessaging,
  platform,
  onDeviceRegistrationTokenLinkIdChange
}: {
  deep: DeepClient;
  deviceLinkId: number;
  firebaseMessaging: Messaging;
  platform: DeviceInfo['platform'];
  onDeviceRegistrationTokenLinkIdChange: (deviceRegistrationTokenLinkId: number) => void;
}) {
  return <Card>
  <CardHeader>
    <Heading size="md">Register Device</Heading>
  </CardHeader>
  <CardBody>
    <Button
      onClick={async () => {
        await registerDevice({
          deep,
          deviceLinkId,
          firebaseMessaging,
          callback: async ({ deviceRegistrationToken }) => {
            const {serialOperations, linkIds} =  await getDeviceRegistrationTokenInsertSerialOperations({
              deep,
              containerLinkId: deviceLinkId,
              deviceRegistrationToken
            })
            await deep.serial({
              operations: serialOperations,
            })
            onDeviceRegistrationTokenLinkIdChange(linkIds.deviceRegistrationTokenLinkId);
          },
        });
      }}
    >
      Register
    </Button>
  </CardBody>
</Card>
}

function PermissionsCard({
  platform
}: {
  platform: DeviceInfo['platform'];
}) {
  const [isPermissionsGranted, setIsPermissionsGranted] = useState(undefined);

  useEffect(() => {
    new Promise(async () => {
      checkPermissions();
      let isPermissionsGranted: boolean;
      if (!platform) {
        return;
      } else if (platform === 'web') {
        isPermissionsGranted = Notification.permission === 'granted';
      } else {
        let permissionsStatus = await PushNotifications.checkPermissions();
        isPermissionsGranted = permissionsStatus.receive === 'granted';
      }

      setIsPermissionsGranted(isPermissionsGranted);
    });
  }, [platform]);
  return <Card>
  <CardHeader>
    <Heading size="md">Permissions</Heading>
  </CardHeader>
  <CardBody>
    <Stack>
      <Text suppressHydrationWarning>
        Permissions are {!isPermissionsGranted && 'not'} granted
      </Text>
      <Button
        isDisabled={!platform}
        onClick={() => {
          new Promise(async () => {
            if (!platform) {
              return;
            }
            const isPermissionsGranted = await requestPermissions();
            setIsPermissionsGranted(isPermissionsGranted);
          });
        }}
      >
        Request permissions
      </Button>
    </Stack>
  </CardBody>
</Card>
}

function GeneralInfoCard(
  {
    deep,
    deviceLinkId,
    deviceRegistrationTokenLinkId,
    platform
  } :
  {
    deep: DeepClient;
    deviceLinkId: number;
    deviceRegistrationTokenLinkId: number;
    platform: DeviceInfo['platform'];
  }
) {
  return <Card>
  <CardHeader>
    <Heading size="md">General Info</Heading>
  </CardHeader>
  <CardBody>
    <Stack>
      <Text suppressHydrationWarning>
        Deep link id: {deep.linkId ?? ' '}
      </Text>
      <Text suppressHydrationWarning>
        Device link id: {deviceLinkId ?? ' '}
      </Text>
      <Text suppressHydrationWarning>
        Device registration token link id:{' '}
        {deviceRegistrationTokenLinkId ?? ' '}
      </Text>
      <Text suppressHydrationWarning>Platform: {platform ?? ' '}</Text>
    </Stack>
  </CardBody>
</Card>
}

function NotifyInsertionButton({ deep, pushNotifications }: { deep: DeepClient; pushNotifications: Array<PushNotificationInfo&{linkId: number}>}) {
  const devicePackage = new CapacitorDevicePackage({deep});
    const {
    data: deviceLinks,
    loading: isDeviceLinksSubscriptionLoading,
    error: deviceLinksSubscriptionError,
  } = deep.useDeepSubscription({
    type_id: {
      _id: [devicePackage.name, devicePackage.Device.name],
    },
    in: {
      type_id: {
        _id: ['@deep-foundation/core', 'Contain'],
      },
      from_id: deep.linkId,
    },
  });
  const [deviceToNotifyLinkId, setDeviceToNotifyLinkId] = useState<number>(undefined);
  const [pushNotificationToNotifyLinkId, setPushNotificationToNotifyLinkId] = useState<number>(undefined);
  type Device = DeviceInfo & {linkId: number};
  const [devices, setDevices] = useState<Device[] | undefined>(undefined);
  useEffect(() => {
    if (isDeviceLinksSubscriptionLoading) {
      return;
    }
    new Promise(async () => {
      const devices = [];
      for (const deviceLink of deviceLinks) {
        try {
          const device = await getDevice({
            deep,
            deviceLinkId: deviceLink.id,
          });
          devices.push({
            ...device,
            linkId: deviceLink.id,
          });
        } catch (error) {
          console.error(error)
          continue;
        }

      }
      setDevices(devices);
    });
  }, [
    deviceLinks,
    isDeviceLinksSubscriptionLoading,
    deviceLinksSubscriptionError,
  ]);
    const [isNotifyInsertionModalOpened, setIsNotifyInsertionModalOpened] =
    useState<boolean>(false);
  const notifyInsertionModalOnClose = () => {
    setIsNotifyInsertionModalOpened(false);
  };
  const notifyInsertionCard = (
    <Card>
      <Button
        onClick={async () => {
          setIsNotifyInsertionModalOpened((oldState) => !oldState);
        }}
      >
        Insert Notify Links
      </Button>
      {isNotifyInsertionModalOpened && (
        <Modal
          isOpen={isNotifyInsertionModalOpened}
          onClose={notifyInsertionModalOnClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Insert</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <HStack divider={<StackDivider />}>
                <Stack>
                  {pushNotifications && pushNotifications.map((pushNotification, i) => {
                    const isActive = pushNotificationToNotifyLinkId === pushNotification.linkId;
                    return <PushNotificationComponent
                    key={i}
                    pushNotification={pushNotification}
                    cardProps={{
                      ...(isActive && {
                        boxShadow: "outline",
                      }),
                      onClick: () => {
                        setPushNotificationToNotifyLinkId(isActive ? undefined : pushNotification.linkId)
                      }
                    }}
                  />
                  })}
                  {/* <Button>
                    ABC1
                  </Button>
                  <Button>
                    ABC2
                  </Button>
                  <Button>
                    ABC3
                  </Button> */}
                </Stack>
                <Stack>
                  {devices && devices.map((device) => {
                    const isActive = deviceToNotifyLinkId === device.linkId;
                    return <DeviceComponent key={device.linkId} device={device} cardProps={{
                      ...(isActive && {
                        boxShadow: "outline",
                      }),
                      onClick: () => {
                        setDeviceToNotifyLinkId(isActive ? undefined : device.linkId)
                      }
                    }} />
                  })}
                                    {/* <Button>
                    ABC1
                  </Button>
                  <Button>
                    ABC2
                  </Button>
                  <Button>
                    ABC3
                  </Button> */}
                </Stack>
              </HStack>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={notifyInsertionModalOnClose}
              >
                Close
              </Button>
              <Button variant="ghost" isDisabled={!pushNotificationToNotifyLinkId || !deviceToNotifyLinkId} onClick={async () => {
                const {serialOperations: notifyInsertSerialOperations} = await getNotifyInsertSerialOperations({
                  deep,
                  deviceLinkId: deviceToNotifyLinkId,
                  pushNotificationLinkId: pushNotificationToNotifyLinkId,
                  containerLinkId: deep.linkId
                })
                await deep.serial({
                  operations: notifyInsertSerialOperations
                })
              }}>Notify</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Card>
  );

  return notifyInsertionCard;

  // const [pushNotificationToNotifyLinkId, setPushNotificationToNotifyLinkId] = useState<number|undefined>(undefined)
  // const [deviceToNotifyLinkId, setDeviceToNotifyLinkId] = useState(0)
  // const notifyInsertionCard = <Card>
  //   <CardHeader>
  //     <Heading size='md'>Insert Notify</Heading>
  //   </CardHeader>
  //   <CardBody>

  //       <label htmlFor={"pushNotificationToNotifyLinkIdNumberInput"}>Push Notification Link Id To Notify</label>
  //     <NumberInput value={pushNotificationToNotifyLinkId} onChange={(value) => {
  //       setPushNotificationToNotifyLinkId(value !== '' ? parseInt(value) : undefined)
  //     }}>
  //       <NumberInputField id={"pushNotificationToNotifyLinkIdNumberInput"} placeholder='Device Link Id To Notify'/>
  //     </NumberInput>
  //     <label htmlFor={"pushNotificationToNotifyLinkIdNumberInput"}>Device Link Id To Notify Link Id</label>
  //     <NumberInput  value={deviceToNotifyLinkId} onChange={(value) => {
  //       setDeviceToNotifyLinkId(value !== '' ? parseInt(value) : undefined)
  //     }}>
  //       <NumberInputField placeholder='Device Link Id To Be Notified'/>
  //     </NumberInput>
  //     <Button
  //       onClick={async () => {
  //         const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
  //         const notifyTypeLinkId = await deep.id(PACKAGE_NAME, "Notify");
  //         await deep.insert({
  //           type_id: notifyTypeLinkId,
  //           from_id: pushNotificationToNotifyLinkId,
  //           to_id: deviceToNotifyLinkId,
  //           in: {
  //             data: {
  //               type_id: containTypeLinkId,
  //               from_id: deep.linkId
  //             }
  //           }
  //         })
  //       }}
  //     >
  //       Register
  //     </Button>
  //   </CardBody>
  // </Card>;
}