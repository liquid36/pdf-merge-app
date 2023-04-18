import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import { useEffect, useReducer } from 'react';

const initialList: any[] = [];

function reducer(state: any, action: any) {
    switch (action.type) {
        case 'add':
            return [...state, action.payload];
        case 'reset':
            return [];
        case 'minus': {
            const index = state.indexOf(action.payload);
            state.splice(index, 1);
            state.splice(index - 1, 0 ,action.payload);
            return [...state];
        }
        case 'plus': {
            const index = state.indexOf(action.payload);
            state.splice(index, 1);
            state.splice(index + 1, 0, action.payload);
            return [...state];
        }
        default:
          throw new Error();
    }
}

function ListItem(props: any) {
  const getFilename = (fileName: string) => {
    if (fileName.indexOf('/') >= -1) {
      const index = fileName.lastIndexOf('/');
      const name = fileName.substring(index + 1);
      return name;
    } else {
      const index = fileName.lastIndexOf('\\');
      const name = fileName.substring(index + 1);
      return name;
    }
  }
  const fileName: string = getFilename(props.name);

  const onPlusClick = () => props.onPlusClick && props.onPlusClick();
  const onMinusClick = () => props.onMinusClick && props.onMinusClick();

  return (
    <li className="btn-list">
      { fileName }
      { !props.isFirst  && <button onClick={onMinusClick}> - </button> }
      { !props.isLast && <button onClick={onPlusClick}> + </button> }
    </li>
  )
}

function Main() {
  const [state, dispatch] = useReducer(reducer, initialList);

  useEffect(() => {
    window.electron.ipcRenderer.on('open-dialog', (arg: any) => {
      if (!arg.canceled) {
        arg.filePaths.forEach((file: string) => dispatch({ type: 'add', payload: file }))
      }
    });
  }, []);

  const onClick = () => {
    window.electron.ipcRenderer.sendMessage('open-dialog', []);
  }

  const onSave = () => {
    window.electron.ipcRenderer.sendMessage('merge-files', state);
  }

  const onReset = () => {
    dispatch({ type: 'reset' });
  }

  const onMinusClick = (item: string) => {
    dispatch({ type: 'minus', payload: item });
  }

  const onPlusClick = (item: string) => {
    dispatch({ type: 'plus', payload: item });
  }

  const onDrag = (e) => {
    e.preventDefault();
    if (e.type === 'drop') {
      for (const file of e.dataTransfer.files)  {
        dispatch({ type: 'add', payload: file.path })
      }
    }
  }

  return (
     <>

      <div className="Hello" onDrop={onDrag}  onDragOver={onDrag} onDrag={onDrag} onDragStart={onDrag} onDragEnter={onDrag}>
        <ol>
          {
            state.map((item, index, list) => {
              const isFirst = index === 0;
              const isLast = index === list.length - 1;
              return <ListItem name={item} isFirst={isFirst} isLast={isLast} onMinusClick={() => onMinusClick(item)} onPlusClick={() => onPlusClick(item)}></ListItem>
            })
          }
        </ol>
      </div>
      <div className="btn-list">
          <button className="btn" type="button" onClick={onClick}>
            Agregar archivos
          </button>

          <button className="btn" type="button" onClick={onSave}>
            Crear PDF
          </button>

          <button className="btn" type="button" onClick={onReset}>
            Reset
          </button>

      </div>
     </>
  );
}

export default function App() {

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
        </Routes>
      </Router>
  );
}
