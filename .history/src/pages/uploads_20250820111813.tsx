import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  File, 
  Users, 
  Database, 
  Wifi, 
  Briefcase, 
  FileText,
  X,
  Check,
  Star,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';

const BulkUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState([
    {
      id: 1,
      name: "Jordan Antony",
      position: "Network administrator",
      accessLevel: 4,
      employId: "WBFLW 7233469",
      joinedOn: "23 March, 2024",
      avatar: "JA",
      selected: true
    },
    {
      id: 2,
      name: "Marcus Aron",
      position: "User experience designer",
      accessLevel: 3,
      employId: "WBFLW 7234369",
      joinedOn: "23 March, 2024",
      avatar: "MA",
      selected: true
    },
    {
      id: 3,
      name: "Grace Philip",
      position: "Database administrator",
      accessLevel: 3,
      employId: "WBFLW 7212369",
      joinedOn: "23 March, 2024",
      avatar: "GP",
      selected: true
    }
  ]);

 ;

  const handleDrag = useCallback((e:any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e:any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file:File) => {
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setUploadedFile(file);
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 65) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 2000);
          }, 500);
          return 65;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const cancelUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadedFile(null);
  };

 
  const toggleSelection = (id:number) => {
    setPreviewData(prev => 
      prev.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  return (
    <div className="min-h-screen ">
 
 

      {/* Main Content */}
      <div className="px-6">
        <h1 className="text-3xl font-bold mb-8">Bulk Upload</h1>

        {/* Upload Section */}
        <div className="relative mb-8">
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
     

            {/* Central upload area */}
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Upload By Clicking Here Or Drag And Drop Your File
              </h3>
              <a href="/sample.xlsx" download className='p-6'>Download Template</a>
              <Button
                onClick={() => {
                  if(document){
                    document.getElementById('file-input')?.click()
                  }
                }}
            variant={"default"}
              >
                Upload Data
              </Button>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  if (e.target && e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>

          {/* Upload Progress */}
          {(isUploading || uploadedFile) && (
            <div className="mt-4 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded flex items-center justify-center">
                    <File className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium">New_employee_2nd Week.xlsx</div>
                    <div className="text-sm text-gray-400">Uploading data from the file</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {isUploading && (
                    <>
                      <span className="text-sm font-medium">{Math.round(uploadProgress)}%</span>
                      <button
                        onClick={cancelUpload}
                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
              {isUploading && (
                <div className="mt-3">
                  <div className="w-full rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

       
        {(uploadedFile && !isUploading) && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Preview of Uploaded Data</h2>
              <div className="flex items-center space-x-2 ">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span className="text-sm">Loading ...</span>
              </div>
            </div>

            {!isLoading && (
              <div className=" rounded-lg overflow-hidden">
                <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-700 text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <span>Name & Position</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                  <div>Access level</div>
                  <div>Employ ID</div>
                  <div>Joined on</div>
                  <div></div>
                </div>

                {previewData.map((employee) => (
                  <div
                    key={employee.id}
                    className="grid grid-cols-5 gap-4 p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-750"
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleSelection(employee.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center  `}
                      >
                        {employee.selected && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div className="w-10 h-10    rounded-full flex items-center justify-center">
                        <span className=" text-sm font-medium">{employee.avatar}</span>
                      </div>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm  ">{employee.position}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                    
                      <span className="ml-2 text-sm  ">Level {employee.accessLevel}</span>
                    </div>
                    <div className="flex items-center  ">{employee.employId}</div>
                    <div className="flex items-center  ">{employee.joinedOn}</div>
                    <div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;