import { observer } from 'mobx-react-lite';
import React, { useCallback } from 'react';
import './editor.scss';
import './tags/tags.scss';
import { renderChildren } from './utility/renderchild';
import CactivaBreadcrumb from './CactivaBreadcrumb';
import CactivaToolbar from './CactivaToolbar';
import { useDropzone } from 'react-dropzone';
import CactivaDraggable from './CactivaDraggable';
import { Tooltip, IconButton } from 'evergreen-ui';
import {
  prepareChanges,
  commitChanges,
  createNewElement,
  insertAfterElementId,
  addChildInId
} from './utility/elements/tools';
import { toJS } from 'mobx';
import { SyntaxKind } from './utility/kinds';
import api from '@src/libs/api';

const uploadImage = async (file: any) => {
  var formDataToUpload = new FormData();
  formDataToUpload.append('file', file);
  return await api.post('/assets/upload', formDataToUpload, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export default observer(({ source, editor }: any) => {
  const children = renderChildren(
    { name: '--root--', children: [source] },
    editor
  );

  const onDrop = useCallback(async acceptedFiles => {
    if (!acceptedFiles[0].type.includes('image/')) {
      alert('Images only!');
      return;
    }
    prepareChanges(editor);
    const el = createNewElement('Image');
    const file: any = await uploadImage(acceptedFiles[0]);
    el.props['source'] = {
      kind: SyntaxKind.CallExpression,
      value: `require('@src/assets/images/${file.filename}')`
    };
    el.props['style'] = {
      kind: SyntaxKind.ObjectLiteralExpression,
      value: {
        width: {
          kind: SyntaxKind.NumericLiteral,
          value: 250
        }
      }
    };
    if (source.children.length > 0) {
      const idx = source.children.length - 1;
      insertAfterElementId(source, source.children[idx].id, el);
    } else {
      addChildInId(source, source.id, el);
    }
    commitChanges(editor);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  return (
    <div className="cactiva-editor" {...getRootProps()}>
      <input {...getInputProps()} />
      <div className="cactiva-wrapper">
        <CactivaToolbar />
        <div className="cactiva-canvas">{children}</div>
      </div>
      <CactivaBreadcrumb source={source} editor={editor} />
    </div>
  );
});
