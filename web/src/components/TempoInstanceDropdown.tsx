import { Popover, Stack } from '@patternfly/react-core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TempoResource, useTempoResources } from '../hooks/useTempoResources';
import { TempoInstance } from '../hooks/useTempoInstance';
import { HelpIcon } from '@patternfly/react-icons';
import { TypeaheadSelect } from './TypeaheadSelect';

interface TempoInstanceDropdownProps {
  tempo: TempoInstance | undefined;
  setTempo: (tempo: TempoInstance) => void;
}

interface TempoResourceOption {
  value: string;
  children: string;
  tempo: TempoResource;
}

export const TempoInstanceDropdown = ({ tempo, setTempo }: TempoInstanceDropdownProps) => {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const { loading: tempoResourcesLoading, tempoResources } = useTempoResources();

  const options: TempoResourceOption[] = (tempoResources ?? [])
    .map((tempo) => ({
      value: `${tempo.namespace}__${tempo.name}`,
      children: `${tempo.namespace} / ${tempo.name}`,
      tempo,
    }))
    .sort((a, b) => a.children.toString().localeCompare(b.children.toString()));

  let selected: TempoResourceOption | undefined = undefined;
  if (tempo) {
    if (tempoResourcesLoading) {
      // Preselect the dropdown option without waiting until the list of TempoResources is loaded to prevent flickering.
      // To accomplish this, we'll create a slightly inaccurate TempoResourceSelectOption,
      // because the kind and the list of tenants is not known before the list of TempoResources is loaded.
      selected = {
        value: `${tempo.namespace}__${tempo.name}`,
        children: `${tempo.namespace} / ${tempo.name}`,
        tempo: {
          kind: 'TempoStack',
          namespace: tempo.namespace,
          name: tempo.name,
          tenants: tempo.tenant ? [tempo.tenant] : undefined,
        },
      };
      options.push(selected);
    } else {
      selected = options.find(
        (o) => o.tempo.namespace == tempo.namespace && o.tempo.name == tempo.name,
      );
    }
  }

  const onSelect = (value?: string) => {
    if (!value) return;

    const option = options.find((o) => o.value === value);
    if (option && option.value !== selected?.value) {
      setTempo({
        namespace: option.tempo.namespace,
        name: option.tempo.name,
        tenant: option.tempo.tenants?.[0], // select first tenant by default, or undefined if no tenants
      });
    }
  };

  return (
    <>
      <Stack>
        <label htmlFor="tempoinstance-dropdown">
          {t('Tempo Instance')}{' '}
          <Popover
            headerContent={<div>{t('Select a Tempo instance')}</div>}
            bodyContent={<div>{t('tempoinstance_helptext')}</div>}
          >
            <HelpIcon />
          </Popover>
        </label>
        <TypeaheadSelect
          id="tempoinstance-dropdown"
          width={320}
          loading={tempoResourcesLoading}
          placeholder={t('Select a Tempo instance')}
          options={options}
          selected={selected?.value}
          setSelected={onSelect}
        />
      </Stack>
      {selected?.tempo.tenants && selected.tempo.tenants.length > 0 && tempo && (
        <Stack>
          <label htmlFor="tenant-dropdown">{t('Tenant')}</label>
          <TypeaheadSelect
            id="tenant-dropdown"
            width={200}
            placeholder={t('Select a tenant')}
            options={selected.tempo.tenants.map((t) => ({ value: t, children: t }))}
            selected={tempo.tenant}
            setSelected={(tenant) => setTempo({ ...tempo, tenant })}
          />
        </Stack>
      )}
    </>
  );
};
