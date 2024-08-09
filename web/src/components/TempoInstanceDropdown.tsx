import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  Spinner,
} from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { TempoResource, useTempoResources } from '../hooks/useTempoResources';
import { TypeaheadSelect } from './TypeaheadSelect';
import { useTempoInstance } from '../hooks/useTempoInstance';

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

export const TempoInstanceDropdown = () => {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const { loading, tempoResources } = useTempoResources();
  const [tempo, setTempo] = useTempoInstance();
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<TempoResourceSelectOption | undefined>();
  const options = tempoResources
    .map((tempo) => new TempoResourceSelectOption(tempo))
    .sort((a, b) => a.toString().localeCompare(b.toString()));

  // This dropdown works with TempoResource[], i.e. a list of Tempo CRs (including all tenants).
  // We cannot set the initial state of the 'selected' variable based on the query parameters,
  // because TempoResource needs a list of tenants, which is returned from the API.
  React.useEffect(() => {
    if (tempo) {
      const tempoCR = tempoResources.find(
        (res) => res.namespace == tempo.namespace && res.name == tempo.name,
      );
      setSelected(tempoCR ? new TempoResourceSelectOption(tempoCR) : undefined);
    } else {
      setSelected(undefined);
    }
  }, [tempo, tempoResources]);

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: React.MouseEvent | React.ChangeEvent, value: SelectOptionObject) => {
    const option = value as TempoResourceSelectOption;
    setSelected(option);
    setTempo({
      namespace: option.tempo.namespace,
      name: option.tempo.name,
      tenant: option.tempo.tenants?.[0], // select first tenant by default, or undefined if no tenants
    });
    setIsOpen(false);
  };

  const clearSelection = () => {
    setSelected(undefined);
    setTempo(undefined);
    setIsOpen(false);
  };

  const onFilter = (_event: React.ChangeEvent<HTMLInputElement> | null, value: string) => {
    return options
      .filter((option) => {
        return !option.toString().search(value);
      })
      .map((item, index) => {
        return <SelectOption key={index} value={item}></SelectOption>;
      });
  };

  return (
    <>
      <Select
        id="tempoinstance-dropdown"
        variant={SelectVariant.typeahead}
        onFilter={onFilter}
        onToggle={onToggle}
        onSelect={onSelect}
        onClear={clearSelection}
        selections={selected}
        isOpen={isOpen}
        placeholderText={t('Select a Tempo instance')}
        typeAheadAriaLabel={t('Select a Tempo instance')}
        width={350}
      >
        {loading
          ? [
              <SelectOption isLoading key="custom-loading" value="loading">
                <Spinner size="lg" />
              </SelectOption>,
            ]
          : // TODO: show resource icon in <SelectOption>
            options.map((option, index) => <SelectOption key={index} value={option} />)}
      </Select>

      {selected?.tempo.tenants && selected.tempo.tenants.length > 0 && tempo && (
        <TypeaheadSelect
          width={200}
          label={t('Select a tenant')}
          allowClear={false}
          options={selected.tempo.tenants}
          selected={tempo.tenant}
          setSelected={(tenant) => setTempo({ ...tempo, tenant })}
        />
      )}
    </>
  );
};
