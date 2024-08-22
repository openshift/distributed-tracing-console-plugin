import {
  Popover,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  Spinner,
  Stack,
} from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { TempoResource, useTempoResources } from '../hooks/useTempoResources';
import { TypeaheadSelect } from './TypeaheadSelect';
import { TempoInstance } from '../hooks/useTempoInstance';
import { HelpIcon } from '@patternfly/react-icons';

interface TempoInstanceDropdownProps {
  tempo: TempoInstance | undefined;
  setTempo: (tempo: TempoInstance) => void;
}

class TempoResourceSelectOption implements SelectOptionObject {
  constructor(public tempo: TempoResource) {}
  public toString() {
    return `${this.tempo.namespace} / ${this.tempo.name}`;
  }
  public compareTo(other: TempoResourceSelectOption) {
    return (
      this.tempo.kind === other.tempo.kind &&
      this.tempo.namespace === other.tempo.namespace &&
      this.tempo.name === other.tempo.name
    );
  }
}

export const TempoInstanceDropdown = ({ tempo, setTempo }: TempoInstanceDropdownProps) => {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const { loading: tempoResourcesLoading, tempoResources } = useTempoResources();
  const [isOpen, setIsOpen] = React.useState(false);
  const options = (tempoResources ?? [])
    .map((tempo) => new TempoResourceSelectOption(tempo))
    .sort((a, b) => a.toString().localeCompare(b.toString()));

  let selected: TempoResourceSelectOption | undefined = undefined;
  if (tempo) {
    if (tempoResourcesLoading) {
      // Preselect the dropdown option without waiting until the list of TempoResources is loaded to prevent flickering.
      // To accomplish this, we'll create a slightly inaccurate TempoResourceSelectOption,
      // because the kind and the list of tenants is not known before the list of TempoResources is loaded.
      selected = new TempoResourceSelectOption({
        kind: 'TempoStack',
        namespace: tempo.namespace,
        name: tempo.name,
        tenants: tempo.tenant ? [tempo.tenant] : undefined,
      });
    } else {
      selected = options.find(
        (o) => o.tempo.namespace == tempo.namespace && o.tempo.name == tempo.name,
      );
    }
  }

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: React.MouseEvent | React.ChangeEvent, value: SelectOptionObject) => {
    const option = value as TempoResourceSelectOption;
    setTempo({
      namespace: option.tempo.namespace,
      name: option.tempo.name,
      tenant: option.tempo.tenants?.[0], // select first tenant by default, or undefined if no tenants
    });
    setIsOpen(false);
  };

  const onFilter = (_event: React.ChangeEvent<HTMLInputElement> | null, value: string) => {
    return options
      .filter((option) => {
        return option.toString().includes(value);
      })
      .map((item, index) => {
        return <SelectOption key={index} value={item}></SelectOption>;
      });
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
        <Select
          id="tempoinstance-dropdown"
          variant={SelectVariant.typeahead}
          onFilter={onFilter}
          onToggle={onToggle}
          onSelect={onSelect}
          selections={selected}
          isOpen={isOpen}
          placeholderText={t('Select a Tempo instance')}
          typeAheadAriaLabel={t('Select a Tempo instance')}
          width={320}
        >
          {tempoResourcesLoading
            ? [
                <SelectOption isLoading key="custom-loading" value="loading">
                  <Spinner size="lg" />
                </SelectOption>,
              ]
            : // TODO: show resource icon in <SelectOption>
              options.map((option, index) => <SelectOption key={index} value={option} />)}
        </Select>
      </Stack>
      {selected?.tempo.tenants && selected.tempo.tenants.length > 0 && tempo && (
        <Stack>
          <label htmlFor="tenant-dropdown">{t('Tenant')}</label>
          <TypeaheadSelect
            id="tenant-dropdown"
            width={200}
            label={t('Select a tenant')}
            allowClear={false}
            options={selected.tempo.tenants}
            selected={tempo.tenant}
            setSelected={(tenant) => setTempo({ ...tempo, tenant })}
          />
        </Stack>
      )}
    </>
  );
};
