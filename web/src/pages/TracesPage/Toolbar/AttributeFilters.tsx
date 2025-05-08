import React, { useState } from 'react';
import {
  ToolbarGroup,
  ToolbarItem,
  ToolbarFilter,
  Popover,
  Form,
  FormGroup,
} from '@patternfly/react-core';
import { FilterIcon, HelpIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { TempoInstance } from '../../../hooks/useTempoInstance';
import { ControlledSimpleSelect } from '../../../components/ControlledSelects';
import { TypeaheadSelectOption } from '@patternfly/react-templates';
import { filterToTraceQL } from './Filter/traceql_from_filter';
import {
  DebouncedTextInput,
  DebouncedTextInputProps,
} from '../../../components/DebouncedTextInput';
import { traceQLToFilter } from './Filter/traceql_to_filter';
import { TypeaheadCheckboxSelect } from '../../../components/TypeaheadCheckboxSelect';
import { DurationField, Filter, splitByUnquotedWhitespace } from './Filter/filter';
import { useTagValues } from '../../../hooks/useTagValues';

const serviceNameFilter = { content: 'Service Name', value: 'serviceName' };
const spanNameFilter = { content: 'Span Name', value: 'spanName' };
const namespaceFilter = { content: 'Namespace', value: 'namespace' };
const statusFilter = { content: 'Status', value: 'status' };
const spanDurationFilter = { content: 'Span Duration', value: 'spanDuration' };
const traceDurationFilter = { content: 'Trace Duration', value: 'traceDuration' };
const customAttributeFilter = { content: 'Custom Attributes', value: 'attribute' };
const attributeFilterOptions = [
  serviceNameFilter,
  spanNameFilter,
  namespaceFilter,
  statusFilter,
  spanDurationFilter,
  traceDurationFilter,
  customAttributeFilter,
];

interface AttributeFiltersProps {
  tempo: TempoInstance | undefined;
  query: string;
  setQuery: (query: string) => void;
}

const statusOptions = [
  { content: 'unset', value: 'unset' },
  { content: 'ok', value: 'ok' },
  { content: 'error', value: 'error' },
];

export function AttributeFilters(props: AttributeFiltersProps) {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const { tempo, query, setQuery } = props;
  const [activeFilter, setActiveFilter] = useState<string | undefined>(
    attributeFilterOptions[0].value,
  );

  const filter = traceQLToFilter(query);
  const setFilter = (filter: Filter) => {
    setQuery(filterToTraceQL(filter));
  };

  const { data: serviceNameOptions } = useTagValues(
    tempo,
    'resource.service.name',
    filterToTraceQL({ ...filter, serviceName: [] }),
    activeFilter === serviceNameFilter.value,
  );
  const { data: spanNameOptions } = useTagValues(
    tempo,
    'name',
    filterToTraceQL({ ...filter, spanName: [] }),
    activeFilter === spanNameFilter.value,
  );
  const { data: namespaceOptions } = useTagValues(
    tempo,
    'resource.k8s.namespace.name',
    filterToTraceQL({ ...filter, namespace: [] }),
    activeFilter === namespaceFilter.value,
  );

  return (
    <ToolbarGroup variant="filter-group">
      <ToolbarItem>
        <Form>
          <FormGroup fieldId="active-filter-select" label={t('Filter')}>
            <ControlledSimpleSelect
              id="active-filter-select"
              options={attributeFilterOptions}
              value={activeFilter}
              setValue={setActiveFilter}
              toggleProps={{ icon: <FilterIcon /> }}
            />
          </FormGroup>
        </Form>
      </ToolbarItem>
      <TypeaheadStringAttributeFilter
        label={serviceNameFilter.content}
        show={activeFilter === serviceNameFilter.value}
        options={serviceNameOptions ?? []}
        value={filter.serviceName}
        setValue={(x) => setFilter({ ...filter, serviceName: x })}
      />
      <TypeaheadStringAttributeFilter
        label={spanNameFilter.content}
        show={activeFilter === spanNameFilter.value}
        options={spanNameOptions ?? []}
        value={filter.spanName}
        setValue={(x) => setFilter({ ...filter, spanName: x })}
      />
      <TypeaheadStringAttributeFilter
        label={namespaceFilter.content}
        show={activeFilter === namespaceFilter.value}
        options={namespaceOptions ?? []}
        value={filter.namespace}
        setValue={(x) => setFilter({ ...filter, namespace: x })}
      />
      <TypeaheadStringAttributeFilter
        label={statusFilter.content}
        show={activeFilter === statusFilter.value}
        options={statusOptions ?? []}
        value={filter.status}
        setValue={(x) => setFilter({ ...filter, status: x })}
      />
      <DurationAttributeFilter
        label={spanDurationFilter.content}
        show={activeFilter === spanDurationFilter.value}
        value={filter.spanDuration}
        setValue={(value) => setFilter({ ...filter, spanDuration: value })}
      />
      <DurationAttributeFilter
        label={traceDurationFilter.content}
        show={activeFilter === traceDurationFilter.value}
        value={filter.traceDuration}
        setValue={(value) => setFilter({ ...filter, traceDuration: value })}
      />
      <CustomAttributesFilter
        label={customAttributeFilter.content}
        show={activeFilter === customAttributeFilter.value}
        value={filter.customMatchers}
        setValue={(value) => setFilter({ ...filter, customMatchers: value })}
      />
    </ToolbarGroup>
  );
}

interface TypeaheadStringAttributeFilterProps {
  label: string;
  show?: boolean;
  options: TypeaheadSelectOption[];
  value: string[];
  setValue: (value: string[]) => void;
}

function TypeaheadStringAttributeFilter(props: TypeaheadStringAttributeFilterProps) {
  const { label, show, options, value, setValue } = props;

  return (
    <ToolbarFilter
      labels={value}
      deleteLabel={(_category, label) => setValue(value.filter((x) => x !== label))}
      deleteLabelGroup={() => setValue([])}
      categoryName={label}
      showToolbarItem={show}
    >
      <Form>
        <FormGroup label={<>&nbsp;</>}>
          <TypeaheadCheckboxSelect
            isCreatable={true}
            toggleWidth="20em"
            placeholder={`Filter by ${label}${value.length > 0 ? ' (' + value.length + ')' : ''}`}
            options={options}
            value={value}
            setValue={setValue}
            style={{ maxHeight: '50vh', overflow: 'auto' }}
          />
        </FormGroup>
      </Form>
    </ToolbarFilter>
  );
}

interface DurationAttributeFilterProps {
  label: string;
  show?: boolean;
  value: DurationField;
  setValue: (value: DurationField) => void;
}

function DurationAttributeFilter(props: DurationAttributeFilterProps) {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const { label, show, value, setValue } = props;
  const { min, max } = value;

  let labels: string[] = [];
  if (min && max) {
    labels = [t('between {{min}} and {{max}}', { min, max })];
  } else if (min) {
    labels = [t('greater than {{min}}', { min })];
  } else if (max) {
    labels = [t('less than {{max}}', { max })];
  }

  return (
    <ToolbarFilter
      labels={labels}
      deleteLabel={() => setValue({ min: undefined, max: undefined })}
      deleteLabelGroup={() => setValue({ min: undefined, max: undefined })}
      categoryName={label}
      showToolbarItem={show}
    >
      <Form>
        <FormGroup fieldId="min-duration-input" label={t('Min duration')} style={{ width: '14em' }}>
          <DurationTextInput
            id="min-duration-input"
            placeholder={t('e.g. 100ms')}
            aria-label="min duration"
            value={min ?? ''}
            setValue={(min) => setValue({ min, max })}
          />
        </FormGroup>
      </Form>
      <Form>
        <FormGroup fieldId="max-duration-input" label={t('Max duration')} style={{ width: '14em' }}>
          <DurationTextInput
            id="max-duration-input"
            placeholder={t('e.g. 100ms')}
            aria-label="max duration"
            value={max ?? ''}
            setValue={(max) => setValue({ min, max })}
          />
        </FormGroup>
      </Form>
    </ToolbarFilter>
  );
}

type DurationTextInputProps = Omit<
  DebouncedTextInputProps,
  'waitTime' | 'validationRegex' | 'validationFailedMessage'
>;

const durationFormatRegex = /^([0-9]+\.)?[0-9]+(ns|ms|s|m|h)$/;

export function DurationTextInput(props: DurationTextInputProps) {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');

  return (
    <DebouncedTextInput
      {...props}
      waitTime={1000}
      validationRegex={durationFormatRegex}
      validationFailedMessage={t(
        'Invalid format. Accepted format e.g. 100ms, accepted units: ns, ms, s, m, h',
      )}
    />
  );
}

interface CustomAttributesFilterProps {
  label: string;
  show?: boolean;
  value: string[];
  setValue: (value: string[]) => void;
}

function CustomAttributesFilter(props: CustomAttributesFilterProps) {
  const { label, show, value, setValue } = props;
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');

  return (
    <ToolbarFilter
      labels={value}
      deleteLabel={(_category, label) => setValue(value.filter((x) => x !== label))}
      deleteLabelGroup={() => setValue([])}
      categoryName={label}
      showToolbarItem={show}
    >
      <Form>
        <FormGroup
          fieldId="custom-attributes-input"
          label={t('Custom attributes')}
          labelHelp={
            <Popover
              headerContent={<div>{t('Filter by attributes')}</div>}
              bodyContent={
                <div>
                  {t(
                    'Attributes are written in the form key=value and are combined via AND. Multiple attributes can be separated via space. String values must be quoted. Example:',
                  )}
                  <pre style={{ whiteSpace: 'wrap' }}>
                    {'span.http.status_code=200 span.http.method="GET" duration>5s'}
                  </pre>
                </div>
              }
            >
              <HelpIcon />
            </Popover>
          }
        >
          <DebouncedTextInput
            id="custom-attributes-input"
            size={50}
            placeholder={'span.http.status_code=200 span.http.method="GET"'}
            aria-label="custom attributes"
            waitTime={5000}
            value={value.join(' ')}
            setValue={(x) => setValue(splitByUnquotedWhitespace(x))}
          />
        </FormGroup>
      </Form>
    </ToolbarFilter>
  );
}
