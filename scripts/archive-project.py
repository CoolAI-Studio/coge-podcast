import os
import zipfile
import tarfile

def make_archive():
    base_dir = os.getcwd()
    public_dir = os.path.join(base_dir, 'public')
    os.makedirs(public_dir, exist_ok=True)
    
    zip_path = os.path.join(public_dir, 'project-export.zip')
    tar_path = os.path.join(public_dir, 'project-export.tar.gz')
    
    # Remove existing archives first
    for path in [zip_path, tar_path]:
        if os.path.exists(path):
            try:
                os.remove(path)
            except Exception as e:
                print(f"Warning: could not remove existing file {path}: {e}")

    exclude_dirs = {'.git', 'node_modules', 'dist'}
    exclude_files = {'project-export.zip', 'project-export.tar.gz'}
    
    # Create ZIP
    print("Generating clean ZIP archive...")
    count_zip = 0
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(base_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                if file in exclude_files:
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, base_dir)
                zip_file.write(full_path, rel_path)
                count_zip += 1
                
    # Create TAR.GZ
    print("Generating clean TAR.GZ archive...")
    count_tar = 0
    with tarfile.open(tar_path, 'w:gz') as tar_file:
        for root, dirs, files in os.walk(base_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                if file in exclude_files:
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, base_dir)
                tar_file.add(full_path, rel_path)
                count_tar += 1

    print(f"Archiving completed successfully! Added {count_zip} files to ZIP, {count_tar} files to TAR.GZ.")

if __name__ == '__main__':
    make_archive()
