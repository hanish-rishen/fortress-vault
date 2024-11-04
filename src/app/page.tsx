'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { ItemType, VaultItem } from '@/types/vault';
import { encrypt, encryptFile } from '@/lib/encryption';

export default function Home() {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const fetchVaultItems = async () => {
    try {
      const response = await fetch('/api/vault');
      if (!response.ok) throw new Error('Failed to fetch items');
      const items = await response.json();
      setVaultItems(items);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  useEffect(() => {
    fetchVaultItems();
  }, []);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const encrypted = encrypt(text);
      const response = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'text' as ItemType,
          content: encrypted,
          name: `Note ${new Date().toLocaleString()}`,
          size: `${new Blob([text]).size} bytes`
        })
      });
      
      if (!response.ok) throw new Error('Failed to store text');
      setText('');
      fetchVaultItems();
    } catch (error) {
      console.error('Error storing text:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        console.log('Starting file upload...', file.name);
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          throw new Error('File size must be less than 10MB');
        }

        const encrypted = await encryptFile(file);
        console.log('File encrypted successfully');

        const response = await fetch('/api/vault', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'file',
            content: encrypted,
            name: file.name,
            size: `${(file.size / 1024).toFixed(2)} KB`
          })
        });

        const responseText = await response.text();
        let data;
        
        try {
          data = JSON.parse(responseText);
        } catch {
          console.error('Invalid JSON response:', responseText);
          throw new Error('Server returned invalid JSON');
        }

        if (!response.ok) {
          throw new Error(data.error || 'Failed to store file');
        }

        console.log('Upload successful:', data);
        setFiles(null);
        fetchVaultItems();
      } catch (error) {
        console.error('Detailed upload error:', error);
        alert(error instanceof Error ? error.message : 'Failed to upload file');
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/vault/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      fetchVaultItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const file = droppedFiles[0];
      try {
        const encrypted = await encryptFile(file);
        const response = await fetch('/api/vault', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'file' as ItemType,
            content: encrypted,
            name: file.name,
            size: `${(file.size / 1024).toFixed(2)} KB`
          })
        });

        if (!response.ok) throw new Error('Failed to store file');
        setFiles(null);
        fetchVaultItems();
      } catch (error) {
        console.error('Error storing file:', error);
      }
    }
  };

  return (
    <div className="min-h-screen p-8 bg-background flex items-center justify-center">
      <main className="w-full max-w-7xl space-y-8">
        <header className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 relative">
          <div className="flex justify-between items-stretch">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold mb-2">Fortress Vault</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your fortress of digital security
              </p>
            </div>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/signin';
              }}
              className="rounded px-10 mx-2 -my-3 -mr-3 flex items-center text-sm bg-red-700 text-white hover:bg-red-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Text Vault Section */}
            <section className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Text Vault</h2>
              <form onSubmit={handleTextSubmit} className="space-y-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-40 p-3 border rounded-lg bg-background"
                  placeholder="Enter sensitive text to encrypt..."
                />
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
                >
                  Encrypt & Store Text
                </button>
              </form>
            </section>

            {/* File Vault Section */}
            <section className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">File Vault</h2>
              <div className="space-y-4">
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-sm text-gray-600 dark:text-gray-400"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <Image
                          src="/file.svg"
                          alt="Upload icon"
                          width={24}
                          height={24}
                          className={`dark:invert transition-transform duration-200 ${
                            isDragging ? 'scale-125' : ''
                          }`}
                        />
                      </div>
                      <p>{isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}</p>
                      <p className="text-xs">Support for multiple files</p>
                    </div>
                  </label>
                </div>
                {files && (
                  <div className="text-sm">
                    Selected files: {files.length} file(s)
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Vault Items Table */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Vault Contents</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b dark:border-gray-700">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Date Added</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vaultItems.map((item) => (
                    <tr key={item.id} className="border-b dark:border-gray-700">
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4 capitalize">{item.type}</td>
                      <td className="py-3 px-4">{item.size}</td>
                      <td className="py-3 px-4">
                        {new Date(item.dateAdded).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 flex justify-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete item"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={1.5} 
                            stroke="currentColor" 
                            className="w-5 h-5"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" 
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
