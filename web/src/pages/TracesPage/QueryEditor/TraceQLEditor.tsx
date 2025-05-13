import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CodeMirror, { EditorView, keymap } from '@uiw/react-codemirror';
import { TraceQLExtension } from '@perses-dev/tempo-plugin/lib/components/TraceQLExtension';
import { TempoInstance } from '../../../hooks/useTempoInstance';
import { getProxyURLFor } from '../../../hooks/api';
import { usePatternFlyTheme } from '../../../components/console/utils/usePatternFlyTheme';
import { Prec } from '@codemirror/state';
import { insertNewlineAndIndent } from '@codemirror/commands';

interface TraceQLEditorProps {
  tempo: TempoInstance | undefined;
  query: string;
  setQuery: (query: string) => void;
  runQuery: () => void;
}

export const codemirrorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent !important',
  },
  '.cm-content': {
    padding: 0,
  },
  '.cm-line': {
    padding: 0,
  },
  '&.cm-focused.cm-editor': {
    outline: 'none',
  },
});

export function TraceQLEditor({ tempo, query, setQuery, runQuery }: TraceQLEditorProps) {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const { theme } = usePatternFlyTheme();

  const traceQLExtension = useMemo(() => {
    return TraceQLExtension({ endpoint: tempo ? getProxyURLFor(tempo) : undefined });
  }, [tempo]);

  const keyBindings = useMemo(
    () =>
      Prec.highest(
        keymap.of([
          {
            key: 'Enter',
            run: () => {
              runQuery();
              return true;
            },
          },
          {
            key: 'Shift-Enter',
            run: insertNewlineAndIndent,
          },
        ]),
      ),
    [runQuery],
  );

  return (
    <CodeMirror
      id="traceql-input"
      className="pf-c-form-control"
      theme={theme == 'dark' ? 'dark' : 'light'}
      aria-label="trace query input"
      placeholder={t('TraceQL Query')}
      value={query}
      onChange={setQuery}
      basicSetup={{
        lineNumbers: false,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
        foldGutter: false,
      }}
      extensions={[EditorView.lineWrapping, traceQLExtension, codemirrorTheme, keyBindings]}
    />
  );
}
