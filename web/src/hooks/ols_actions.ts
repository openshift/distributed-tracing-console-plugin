import { action } from 'typesafe-actions';

// The redux actions must be kept in sync with https://github.com/openshift/lightspeed-console/blob/main/src/redux-actions.ts

export enum ActionType {
  AttachmentSet = 'attachmentSet',
  OpenOLS = 'openOLS',
  SetQuery = 'setQuery',
}

export enum AttachmentTypes {
  YAML = 'YAML',
}

export const openOLS = () => action(ActionType.OpenOLS);

export const setQuery = (query: string) => action(ActionType.SetQuery, { query });

export const attachmentSet = (
  attachmentType: string,
  kind: string,
  name: string,
  ownerName: string,
  namespace: string,
  value: string,
  originalValue?: string,
) =>
  action(ActionType.AttachmentSet, {
    attachmentType,
    kind,
    name,
    namespace,
    originalValue,
    ownerName,
    value,
  });
