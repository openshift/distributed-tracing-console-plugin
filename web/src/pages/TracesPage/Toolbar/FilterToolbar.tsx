import React, { useState } from 'react';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Button,
  ToolbarToggleGroup,
  Form,
  FormGroup,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { TempoInstance } from '../../../hooks/useTempoInstance';
import { AttributeFilters } from './AttributeFilters';
import { TempoInstanceDropdown } from '../../../components/TempoInstanceDropdown';
import { filterToTraceQL } from './Filter/traceql_from_filter';
import { TraceQLFilter } from './TraceQLFilter';
import { traceQLToFilter } from './Filter/traceql_to_filter';

interface FilterToolbarProps {
  tempo: TempoInstance | undefined;
  setTempo: (tempo?: TempoInstance) => void;
  query: string;
  /** Update the query. Fetches the search results only if the query changed. */
  setQuery: (query: string) => void;
  /** Update and execute the query. Always fetches the search results. */
  runQuery: (query: string) => void;
}

export function FilterToolbar(props: FilterToolbarProps) {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const { tempo, setTempo, query, setQuery, runQuery } = props;
  const [showAttributeFilters, setShowAttributeFilters] = useState(isSimpleTraceQLQuery(query));

  return (
    <Toolbar customLabelGroupContent={<></>} hasNoPadding>
      <ToolbarContent>
        <TempoInstanceDropdown tempo={tempo} setTempo={setTempo} />
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
          {showAttributeFilters ? (
            <AttributeFilters tempo={tempo} query={query} setQuery={setQuery} />
          ) : (
            <TraceQLFilter tempo={tempo} query={query} runQuery={runQuery} />
          )}
        </ToolbarToggleGroup>
        <ToolbarGroup variant="action-group" align={{ default: 'alignEnd' }} alignItems="center">
          <ToolbarItem>
            <Form>
              <FormGroup label={<>&nbsp;</>}>
                <Button
                  variant="link"
                  onClick={() => setShowAttributeFilters(!showAttributeFilters)}
                  isDisabled={!showAttributeFilters && !isSimpleTraceQLQuery(query)}
                >
                  {showAttributeFilters ? t('Show query') : t('Hide query')}
                </Button>
              </FormGroup>
            </Form>
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
}

function isSimpleTraceQLQuery(query: string) {
  // if a query can be transformed to a filter and back to the original query, we can show the attribute filter toolbar
  return filterToTraceQL(traceQLToFilter(query)) === query;
}
