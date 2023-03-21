import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { generateApolloClient } from '@deep-foundation/hasura/client';
import { getIsPackageInstalled } from "../get-is-package-installed";
import * as dotenv from 'dotenv';
dotenv.config();

export const PACKAGE_NAME = "@deep-foundation/sound-handler"
export const PACKAGE_TYPES = ["GoogleSpeechTranscription", "GoogleCloudAuthFile"]

export default async function installPackage(deviceLinkId) {

  const apolloClient = generateApolloClient({
    path: process.env.NEXT_PUBLIC_GQL_PATH || '', // <<= HERE PATH TO UPDATE
    ssl: !!~process.env.NEXT_PUBLIC_GQL_PATH.indexOf('localhost')
      ? false
      : true,
    // admin token in prealpha deep secret key
    // token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsibGluayJdLCJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJsaW5rIiwieC1oYXN1cmEtdXNlci1pZCI6IjI2MiJ9LCJpYXQiOjE2NTYxMzYyMTl9.dmyWwtQu9GLdS7ClSLxcXgQiKxmaG-JPDjQVxRXOpxs',
  });

  const unloginedDeep = new DeepClient({ apolloClient });
  const guest = await unloginedDeep.guest();
  const guestDeep = new DeepClient({ deep: unloginedDeep, ...guest });
  const admin = await guestDeep.login({
    linkId: await guestDeep.id('deep', 'admin'),
  });
  const deep = new DeepClient({ deep: guestDeep, ...admin });

  if (!await getIsPackageInstalled({ deep, packageName: PACKAGE_NAME })) {
    const typeTypeLinkId = await deep.id('@deep-foundation/core', 'Type');
    const containTypeLinkId = await deep.id('@deep-foundation/core', 'Contain');
    const packageTypeLinkId = await deep.id('@deep-foundation/core', 'Package');
    const joinTypeLinkId = await deep.id('@deep-foundation/core', 'Join');
    const valueTypeLinkId = await deep.id('@deep-foundation/core', 'Value');
    const stringTypeLinkId = await deep.id('@deep-foundation/core', 'String');
    const numberTypeLinkId = await deep.id('@deep-foundation/core', 'Number');
    const objectTypeLinkId = await deep.id('@deep-foundation/core', 'Object');
    const anyTypeLinkId = await deep.id("@deep-foundation/core", "Any");
    const treeTypeLinkId = await deep.id('@deep-foundation/core', 'Tree');
    const treeIncludeNodeTypeLinkId = await deep.id('@deep-foundation/core', 'TreeIncludeNode');
    const treeIncludeUpTypeLinkId = await deep.id('@deep-foundation/core', 'TreeIncludeUp');
    const treeIncludeDownTypeLinkId = await deep.id('@deep-foundation/core', 'TreeIncludeDown');
    const userTypeLinkId = await deep.id('@deep-foundation/core', 'User');

    const { data: [{ id: packageLinkId }] } = await deep.insert({
      type_id: packageTypeLinkId,
      string: { data: { value: PACKAGE_NAME } },
      in: {
        data: [{
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        }]
      },
      out: {
        data: [{
          type_id: joinTypeLinkId,
          to_id: await deep.id('deep', 'users', 'packages')
        }, {
          type_id: joinTypeLinkId,
          to_id: await deep.id('deep', 'admin')
        }]
      },
    })

    const { data: [{ id: soundHandlerTreeId }] } = await deep.insert({
      type_id: treeTypeLinkId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: {
            data: {
              value: "SoundHandlerTree"
            }
          }
        }
      }
    });

    const { data: [{ id: pacakgeTypeLinkId }] } = await deep.insert([...PACKAGE_TYPES.map((TYPE) => ({
      type_id: typeTypeLinkId,
      in: {
        data: [{
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: TYPE } },
        },
        {
          type_id: treeIncludeNodeTypeLinkId,
          from_id: soundHandlerTreeId,
          in: {
            data: [
              {
                type_id: containTypeLinkId,
                from_id: packageLinkId,
              },
            ],
          },
        }],
      },
    })), {
      type_id: typeTypeLinkId,
      from_id: userTypeLinkId,
      to_id: anyTypeLinkId,
      in: {
        data: [{
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: "Transcribe" } }
        },
        {
          type_id: treeIncludeNodeTypeLinkId,
          from_id: soundHandlerTreeId,
          in: {
            data: [
              {
                type_id: containTypeLinkId,
                from_id: packageLinkId,
              },
            ],
          },
        }]
      }
    }])
    console.log("sound-handler package installed");
  }
}