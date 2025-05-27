from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os
import random
import mimetypes

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
MEDIA_FOLDER = 'media_content'
SUPPORTED_EXTENSIONS = {
    'images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
    'videos': ['.mp4', '.webm', '.avi', '.mov'],
    'audio': ['.mp3', '.wav', '.ogg', '.m4a'],
    'text': ['.txt']
}


def get_all_media_files():
    """Get all supported media files from the media_content folder"""
    all_files = []

    for category in SUPPORTED_EXTENSIONS:
        folder_path = os.path.join(MEDIA_FOLDER, category)
        if os.path.exists(folder_path):
            for filename in os.listdir(folder_path):
                file_ext = os.path.splitext(filename)[1].lower()
                if file_ext in SUPPORTED_EXTENSIONS[category]:
                    all_files.append({
                        'filename': filename,
                        'category': category,
                        'path': os.path.join(category, filename),
                        'extension': file_ext
                    })

    return all_files


@app.route('/api/random-content', methods=['GET'])
def get_random_content():
    """Return a random piece of content from the media folder"""
    try:
        all_files = get_all_media_files()

        # If no files found, return default content
        if not all_files:
            default_messages = [
                "🪇 Do you trust me? There's nothing here... yet!",
                "🎭 The mystery deepens - no files to reveal!",
                "🌟 Trust is earned through patience...",
                "🔮 The crystal ball shows... empty folders!",
                "🎪 Welcome to the show that doesn't exist!",
                "🎨 Imagine the most beautiful content here...",
                "🚀 Ready for launch, but no payload found!",
                "🎵 The sound of silence... literally!"
            ]

            return jsonify({
                'success': True,
                'file': {
                    'filename': 'Default Message',
                    'category': 'text',
                    'path': 'default',
                    'extension': '.txt',
                    'text_content': random.choice(default_messages)
                },
                'url': '/api/media/default'
            })

        # Select random file
        selected_file = random.choice(all_files)

        # For text files, read the content
        if selected_file['category'] == 'text':
            try:
                with open(os.path.join(MEDIA_FOLDER, selected_file['path']), 'r', encoding='utf-8') as f:
                    text_content = f.read().strip()
                    # Handle empty files
                    if not text_content:
                        text_content = f"📝 This file ({selected_file['filename']}) appears to be empty!\n\n🤔 Maybe that's the point?"
                    selected_file['text_content'] = text_content
            except Exception as e:
                selected_file[
                    'text_content'] = f"📄 Could not read {selected_file['filename']}\n\n💭 Some mysteries are meant to stay hidden..."

        return jsonify({
            'success': True,
            'file': selected_file,
            'url': f'/api/media/{selected_file["path"]}'
        })

    except Exception as e:
        return jsonify({
            'error': 'Server error',
            'message': str(e)
        }), 500


@app.route('/api/media/<path:filename>')
def serve_media(filename):
    """Serve media files"""
    try:
        # Construct the full path
        full_path = os.path.join(MEDIA_FOLDER, filename)
        directory = os.path.dirname(full_path)
        file_name = os.path.basename(full_path)

        return send_from_directory(directory, file_name)
    except Exception as e:
        return jsonify({'error': f'File not found: {str(e)}'}), 404


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Do you trust me? Backend is running!'
    })


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get statistics about available content"""
    all_files = get_all_media_files()
    stats = {
        'total_files': len(all_files),
        'by_category': {}
    }

    for category in SUPPORTED_EXTENSIONS:
        category_files = [f for f in all_files if f['category'] == category]
        stats['by_category'][category] = len(category_files)

    return jsonify(stats)


if __name__ == '__main__':
    # Create media folders if they don't exist
    for category in SUPPORTED_EXTENSIONS:
        folder_path = os.path.join(MEDIA_FOLDER, category)
        os.makedirs(folder_path, exist_ok=True)

    print("🪇 Do you trust me? Backend starting...")
    print(f"📁 Media folder : {MEDIA_FOLDER}")
    print("🚀 Server running on http://localhost:5000")

    app.run(debug=True, port=5000)
    #hello