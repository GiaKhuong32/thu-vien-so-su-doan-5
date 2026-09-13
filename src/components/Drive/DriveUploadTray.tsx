import { FileUp } from 'lucide-react';
import type { DriveUploadTask } from '../../types/drive';
import { formatBytes } from './driveFormat';
import './DriveUploadTray.css';

export default function DriveUploadTray({ tasks }: { tasks: DriveUploadTask[] }) {
  if (tasks.length === 0) return null;
  return (
    <div className="drive-upload-tray">
      {tasks.map((task) => (
        <div key={task.id} className="drive-upload-task">
          <FileUp size={15} strokeWidth={2} />
          <div className="drive-upload-task__body">
            <div className="drive-upload-task__row">
              <span className="drive-upload-task__name">{task.name}</span>
              <span className="drive-upload-task__size">
                {task.status === 'error' ? 'Lỗi' : formatBytes(task.size)}
              </span>
            </div>
            <div className="drive-upload-task__track">
              <div
                className={`drive-upload-task__fill ${
                  task.status === 'error' ? 'is-error' : ''
                }`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
            {task.status === 'error' && task.error && (
              <div className="drive-upload-task__error">{task.error}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}