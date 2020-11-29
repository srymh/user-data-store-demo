import React, {useState, useEffect, useRef} from 'react';
import './Pane.css';
import {UserDataStore, DataContainer} from 'user-data-store';
// This driver supports only IndexedDB.
import {
  LocalForageDriver,
  LocalForageDriverOptions,
} from 'user-data-store/dist-esm/drivers/LocalForageDriver';
// Just for intellisense of `LocalForageDriverOptions`
import 'localforage';

// Example
type Student = {
  name: string;
  checked: boolean;
};

type Action = 'Add' | 'Remove';

function LocalForagePane() {
  const userDataStore = useRef<
    UserDataStore<Student, LocalForageDriverOptions>
  >(
    new UserDataStore<Student, LocalForageDriverOptions>({
      driver: LocalForageDriver,
      // Intellisense is available if `import 'localforage'` is declared.
      driverOptions: {
        description: 'sample text',
      },
      name: 'School', // IndexedDB: Database name
      storeName: 'Student', // IndexedDB: Table name
      provideKey: (x) => x.name,
    })
  );

  const [students, setStudents] = useState<DataContainer<Student>[]>([]);
  // Initialize `students`
  useEffect(() => {
    userDataStore.current.getItems().then((items) => {
      // set items for this demo
      if (items.length === 0) {
        const students: Student[] = [
          {
            name: 'Suzuki Taro',
            checked: false,
          },
          {
            name: 'Tanaka Hanako',
            checked: true,
          },
        ];
        for (const student of students) {
          // A database is created with the name "School"
          // A table is created with the name "Student" in the School database.
          userDataStore.current.setItem(student).then((result) => {
            if (result instanceof Error) {
              alert(result.message);
            } else {
              userDataStore.current.getItems().then((items) => {
                setStudents(items);
              });
            }
          });
        }
      } else {
        setStudents(items);
      }
    });
  }, []);

  const handleClickShowDataButton = async () => {
    const json = await userDataStore.current.exportAsJson();
    // javascript - Can't edit input text field after window.alert() - Stack Overflow
    // https://stackoverflow.com/questions/56805920/cant-edit-input-text-field-after-window-alert
    alert(json);
  };

  const handleClickExportJsonFileButton = async () => {
    const result = await userDataStore.current.exportAsJsonFile();
    if (result instanceof Error) {
      alert(result.message);
    }
  };

  const refInputFile = useRef<HTMLInputElement>(null);
  const handleImportJsonFileButton = async () => {
    if (refInputFile.current) {
      refInputFile.current.files = null;
      refInputFile.current.click();
    }
  };
  const handleChangeImportJsonFileInput = async () => {
    if (refInputFile.current?.files?.length) {
      const file = refInputFile.current.files[0];
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = async (e) => {
        const json = e.target?.result;
        if (json && typeof json === 'string') {
          const [, error] = await userDataStore.current.importJson(json);
          if (error) {
            alert(error.message);
          } else {
            // update state
            const items = await userDataStore.current.getItems();
            setStudents(items);
          }
        } else {
          alert('Please select a json');
        }
      };
    }
  };

  const handleClickToggleButton = async (key: string) => {
    const item = await userDataStore.current.getItem(key);
    if (item) {
      item.data.checked = !item.data.checked;
      const res = await userDataStore.current.setItem(item.data, item.key);
      if (res instanceof Error) {
        alert(res.message);
      } else {
        // update state
        const items = await userDataStore.current.getItems();
        setStudents(items);
      }
    } else {
      alert(`Key "${key}" was not found.`);
    }
  };

  const [modifiedItem, setModifiedItem] = useState<Student>({
    name: '',
    checked: false,
  });
  const [action, setAction] = useState<Action>('Add');
  const handleGoActionButton = async () => {
    switch (action) {
      case 'Add': {
        const result = await userDataStore.current.setItem(modifiedItem);
        if (result instanceof Error) {
          alert(result.message);
        }
        break;
      }

      case 'Remove':
        await userDataStore.current.removeItem(modifiedItem.name);
        break;

      default:
        break;
    }

    // update state
    const items = await userDataStore.current.getItems();
    setStudents(items);
  };

  const renderTbody = () => {
    return students.map((student) => {
      return (
        <tr key={student.key + student.storedAt}>
          <td>{student.storedAt}</td>
          <td>{student.data.name}</td>
          <td>{student.data.checked ? 'true' : 'false'}</td>
          <td>
            <button
              onClick={async () => {
                handleClickToggleButton(student.key);
              }}>
              toggle
            </button>
          </td>
        </tr>
      );
    });
  };

  const renderForm = () => {
    return (
      <tr>
        <td>
          Action:{' '}
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as Action)}>
            <option value="Add">Add</option>
            <option value="Remove">Remove</option>
          </select>
        </td>
        <td>
          <input
            type="text"
            value={modifiedItem.name}
            onChange={(e) =>
              setModifiedItem((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
          />
        </td>
        <td>
          <select
            value={modifiedItem.checked ? 'true' : 'false'}
            onChange={(e) =>
              setModifiedItem((prev) => ({
                ...prev,
                checked: e.target.value === 'true',
              }))
            }>
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        </td>
        <td>
          <button onClick={handleGoActionButton}>Go</button>
        </td>
      </tr>
    );
  };

  return (
    <div className="Pane">
      <h3>LocalForage</h3>

      <div className="ButtonGroup">
        <button onClick={handleClickShowDataButton}>Show data as json</button>
        <button onClick={handleClickExportJsonFileButton}>
          Export a json file
        </button>
        <button onClick={handleImportJsonFileButton}>
          Import a json file
          <input
            type="file"
            accept=".json"
            ref={refInputFile}
            style={{display: 'none'}}
            onChange={handleChangeImportJsonFileInput}
          />
        </button>
      </div>

      <div className="DataTable">
        <table>
          <thead>
            <tr>
              <th>stored at</th>
              <th>name</th>
              <th>checked</th>
              <th>toggle</th>
            </tr>
          </thead>
          <tbody>
            {renderTbody()}
            {renderForm()}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LocalForagePane;
