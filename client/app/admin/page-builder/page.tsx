'use client'
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Save, 
  Eye, 
  Type, 
  Image, 
  Square, 
  Video, 
  FileText,
  Layout,
  Palette,
  Copy,
  Maximize2,
  Image as ImageIcon,
  Film
} from 'lucide-react';
import { useAuth } from '@/src/app/providers/auth-provider';
import { fetchMediaFiles, MediaFileDto } from '@/src/shared/api/mediafiles';
import { fetchSliders, SliderDto } from '@/src/shared/api/sliders';
import { MediaPickerModal } from '@/src/features/Media/ui/MediaPickerModal';
import { showToast, Notifications } from '@/src/shared/ui';
import styles from './page-builder.module.css';

interface Component {
  id: string;
  type: 'text' | 'image' | 'button' | 'video' | 'container' | 'header' | 'footer' | 'slider';
  content: any;
  styles: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const PageBuilder = () => {
  const { accessToken } = useAuth();
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(true);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaCallback, setMediaCallback] = useState<{ onSelect: (media: any) => void } | null>(null);
  const [sliderPickerMode, setSliderPickerMode] = useState(false);
  const [sliderCallback, setSliderCallback] = useState<{ onSelect: (slider: SliderDto) => void } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Media files and sliders
  const [mediaFiles, setMediaFiles] = useState<MediaFileDto[]>([]);
  const [sliders, setSliders] = useState<SliderDto[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isLoadingSliders, setIsLoadingSliders] = useState(false);

  const componentTemplates = [
    { type: 'text', icon: <Type size={20} />, label: 'Text Block' },
    { type: 'image', icon: <ImageIcon size={20} />, label: 'Image' },
    { type: 'button', icon: <Square size={20} />, label: 'Button' },
    { type: 'video', icon: <Film size={20} />, label: 'Video' },
    { type: 'container', icon: <Square size={20} />, label: 'Container' },
    { type: 'header', icon: <Layout size={20} />, label: 'Header' },
    { type: 'footer', icon: <FileText size={20} />, label: 'Footer' },
    { type: 'slider', icon: <Layout size={20} />, label: 'Slider' },
  ];

  // Load media files and sliders
  useEffect(() => {
    const loadMediaFiles = async () => {
      if (!accessToken) return;
      setIsLoadingMedia(true);
      try {
        const res = await fetchMediaFiles(accessToken, { page: 1, limit: 50 });
        setMediaFiles(res.data);
      } catch (error: any) {
        showToast('Failed to load media files', 'error');
      } finally {
        setIsLoadingMedia(false);
      }
    };

    const loadSliders = async () => {
      if (!accessToken) return;
      setIsLoadingSliders(true);
      try {
        const res = await fetchSliders(accessToken, { page: 1, limit: 50 });
        setSliders(res.data);
      } catch (error: any) {
        showToast('Failed to load sliders', 'error');
      } finally {
        setIsLoadingSliders(false);
      }
    };

    loadMediaFiles();
    loadSliders();
  }, [accessToken]);

  // Handle media picker events
  useEffect(() => {
    const handleOpenMediaPicker = (event: CustomEvent) => {
      setMediaCallback({ onSelect: event.detail.onSelect });
      setShowMediaModal(true);
    };

    window.addEventListener('open-media-picker', handleOpenMediaPicker as EventListener);

    return () => {
      window.removeEventListener('open-media-picker', handleOpenMediaPicker as EventListener);
    };
  }, []);

  const openMediaPicker = (callback: (media: any) => void) => {
    setMediaCallback({ onSelect: callback });
    setShowMediaModal(true);
  };

  const openSliderPicker = (callback: (slider: SliderDto) => void) => {
    setSliderCallback({ onSelect: callback });
    setSliderPickerMode(true);
  };

  const addComponent = (type: string) => {
    const newComponent: Component = {
      id: `component-${Date.now()}`,
      type: type as Component['type'],
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
      position: { x: 50, y: 50 },
      size: { width: 200, height: 100 }
    };
    setComponents([...components, newComponent]);
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text':
        return { text: 'Your text here', fontSize: 16, color: '#000000' };
      case 'image':
        return { src: '', alt: 'Select image from media library' };
      case 'button':
        return { text: 'Click me', backgroundColor: '#3b82f6', color: '#ffffff' };
      case 'video':
        return { src: '', poster: '' };
      case 'container':
        return { backgroundColor: '#f3f4f6', padding: 20 };
      case 'header':
        return { text: 'Header', level: 1 };
      case 'footer':
        return { text: 'Footer content' };
      case 'slider':
        return { sliderId: null };
      default:
        return {};
    }
  };

  const getDefaultStyles = (type: string) => {
    return {
      position: 'absolute',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      backgroundColor: type === 'container' ? '#f3f4f6' : 'transparent'
    };
  };

  const deleteComponent = (id: string) => {
    setComponents(components.filter(comp => comp.id !== id));
    setSelectedComponent(null);
  };

  const duplicateComponent = (id: string) => {
    const component = components.find(comp => comp.id === id);
    if (component) {
      const newComponent = {
        ...component,
        id: `component-${Date.now()}`,
        position: { x: component.position.x + 20, y: component.position.y + 20 }
      };
      setComponents([...components, newComponent]);
    }
  };

  const updateComponent = (id: string, updates: Partial<Component>) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  const renderComponent = (component: Component) => {
    const isSelected = selectedComponent === component.id;
    
    const componentStyle = {
      ...component.styles,
      left: `${component.position.x}px`,
      top: `${component.position.y}px`,
      width: `${component.size.width}px`,
      height: `${component.size.height}px`,
    };

    const renderContent = () => {
      switch (component.type) {
        case 'text':
          return (
            <div 
              style={{ 
                fontSize: component.content.fontSize, 
                color: component.content.color,
                padding: '8px'
              }}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateComponent(component.id, {
                content: { ...component.content, text: e.currentTarget.textContent }
              })}
            >
              {component.content.text}
            </div>
          );
        case 'image':
          return (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              {component.content.src ? (
                <img 
                  src={component.content.src} 
                  alt={component.content.alt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                />
              ) : (
                <div 
                  className={styles.placeholder}
                  onClick={() => openMediaPicker((media) => {
                    updateComponent(component.id, {
                      content: { ...component.content, src: media.url, alt: media.altText || media.filename }
                    });
                  })}
                >
                  <ImageIcon size={32} />
                  <span>Click to select image</span>
                </div>
              )}
            </div>
          );
        case 'button':
          return (
            <button 
              style={{
                backgroundColor: component.content.backgroundColor,
                color: component.content.color,
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateComponent(component.id, {
                content: { ...component.content, text: e.currentTarget.textContent }
              })}
            >
              {component.content.text}
            </button>
          );
        case 'video':
          return (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              {component.content.src ? (
                <video 
                  controls 
                  poster={component.content.poster}
                  style={{ width: '100%', height: '100%', borderRadius: '8px' }}
                >
                  <source src={component.content.src} type="video/mp4" />
                </video>
              ) : (
                <div 
                  className={styles.placeholder}
                  onClick={() => openMediaPicker((media) => {
                    if (media.mimetype.startsWith('video/')) {
                      updateComponent(component.id, {
                        content: { ...component.content, src: media.url }
                      });
                    }
                  })}
                >
                  <Film size={32} />
                  <span>Click to select video</span>
                </div>
              )}
            </div>
          );
        case 'container':
          return (
            <div style={{
              backgroundColor: component.content.backgroundColor,
              padding: `${component.content.padding}px`,
              width: '100%',
              height: '100%',
              borderRadius: '8px'
            }}>
              <div style={{ color: '#9ca3af', textAlign: 'center', marginTop: '20px' }}>
                Container
              </div>
            </div>
          );
        case 'header':
          return (
            <h1 
              style={{ 
                margin: 0, 
                color: component.content.color || '#1f2937',
                fontSize: component.content.level === 1 ? '32px' : '24px'
              }}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateComponent(component.id, {
                content: { ...component.content, text: e.currentTarget.textContent }
              })}
            >
              {component.content.text}
            </h1>
          );
        case 'footer':
          return (
            <div 
              style={{ 
                padding: '16px',
                borderTop: '1px solid #e5e7eb',
                color: '#6b7280'
              }}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateComponent(component.id, {
                content: { ...component.content, text: e.currentTarget.textContent }
              })}
            >
              {component.content.text}
            </div>
          );
        case 'slider':
          return (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              {component.content.sliderId ? (
                <div className={styles.sliderPreview}>
                  <div style={{ 
                    background: '#f3f4f6', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '8px',
                    flexDirection: 'column',
                    cursor: 'pointer'
                  }}
                  onClick={() => openSliderPicker((slider) => {
                    updateComponent(component.id, {
                      content: { ...component.content, sliderId: slider.id, sliderName: slider.name }
                    });
                  })}
                  >
                    <Layout size={24} />
                    <span>{component.content.sliderName || `Slider ID: ${component.content.sliderId}`}</span>
                    <small style={{ color: '#9ca3af', marginTop: '4px' }}>Click to change</small>
                  </div>
                </div>
              ) : (
                <div 
                  className={styles.placeholder}
                  onClick={() => openSliderPicker((slider) => {
                    updateComponent(component.id, {
                      content: { ...component.content, sliderId: slider.id, sliderName: slider.name }
                    });
                  })}
                >
                  <Layout size={32} />
                  <span>Click to select slider</span>
                </div>
              )}
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div
        key={component.id}
        className={`${styles.component} ${isSelected ? styles.selected : ''}`}
        style={componentStyle}
        onClick={() => !isPreviewMode && setSelectedComponent(component.id)}
      >
        {!isPreviewMode && (
          <div className={styles.componentControls}>
            <button 
              className={styles.controlButton}
              onClick={(e) => {
                e.stopPropagation();
                duplicateComponent(component.id);
              }}
            >
              <Copy size={12} />
            </button>
            <button 
              className={styles.controlButton}
              onClick={(e) => {
                e.stopPropagation();
                deleteComponent(component.id);
              }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
        {renderContent()}
      </div>
    );
  };

  return (
    <div className={styles.constructorContainer}>
      <Notifications />
      <MediaPickerModal
        open={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={(media) => {
          if (mediaCallback) {
            mediaCallback.onSelect(media);
          }
          setShowMediaModal(false);
        }}
        zIndex={2001}
      />
      
      {sliderPickerMode && (
        <div className={styles.sliderPickerOverlay}>
          <div className={styles.sliderPickerContent}>
            <div className={styles.sliderPickerHeader}>
              <h3>Select Slider</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setSliderPickerMode(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.sliderPickerInstructions}>
              <p>Select a slider for your page:</p>
              <div className={styles.quickSliderList}>
                {sliders.map((slider) => (
                  <div
                    key={slider.id}
                    className={styles.quickSliderItem}
                    onClick={() => {
                      if (sliderCallback) {
                        sliderCallback.onSelect(slider);
                      }
                      setSliderPickerMode(false);
                    }}
                  >
                    <div className={styles.quickSliderInfo}>
                      <h4>{slider.name}</h4>
                      <p>{slider.description || 'No description'}</p>
                    </div>
                  </div>
                ))}
                {sliders.length === 0 && (
                  <div className={styles.noSliders}>
                    <p>No sliders available. Create one first.</p>
                  </div>
                )}
              </div>
              <div className={styles.sliderPickerActions}>
                <button 
                  className={styles.goToSlidersButton}
                  onClick={() => window.open('/admin/sliders', '_blank')}
                >
                  Manage Sliders
                </button>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setSliderPickerMode(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={styles.header}>
        <h1>Page Builder</h1>
        <div className={styles.headerActions}>
          <button 
            className={`${styles.actionButton} ${isPreviewMode ? styles.active : ''}`}
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye size={20} />
            {isPreviewMode ? 'Edit' : 'Preview'}
          </button>
          <button className={styles.actionButton}>
            <Save size={20} />
            Save
          </button>
          <button className={styles.actionButton}>
            <Settings size={20} />
            Settings
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        {!isPreviewMode && (
          <div className={`${styles.sidebar} ${showComponentLibrary ? styles.show : styles.hide}`}>
            <div className={styles.sidebarHeader}>
              <h3>Components</h3>
              <button 
                className={styles.toggleButton}
                onClick={() => setShowComponentLibrary(!showComponentLibrary)}
              >
                <Layout size={16} />
              </button>
            </div>
            <div className={styles.componentLibrary}>
              {componentTemplates.map((template, index) => (
                <div
                  key={index}
                  className={styles.componentTemplate}
                  onClick={() => addComponent(template.type)}
                >
                  {template.icon}
                  <span>{template.label}</span>
                </div>
              ))}
            </div>
            
            {/* Media Files Section */}
            <div className={styles.mediaSection}>
              <h4>Recent Media Files</h4>
              <div className={styles.mediaGrid}>
                {mediaFiles.slice(0, 6).map((file) => (
                  <div key={file.id} className={styles.mediaItem}>
                    {file.isImage ? (
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL}${file.filepath}`}
                        alt={file.altText || file.filename}
                        className={styles.mediaThumb}
                      />
                    ) : (
                      <div className={styles.mediaPlaceholder}>
                        {file.mimetype.split('/')[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={styles.canvasContainer}>
          <div 
            ref={canvasRef}
            className={styles.canvas}
            style={{ cursor: isPreviewMode ? 'default' : 'crosshair' }}
          >
            {components.map(renderComponent)}
          </div>
        </div>

        {!isPreviewMode && selectedComponent && (
          <div className={`${styles.stylePanel} ${showStylePanel ? styles.show : styles.hide}`}>
            <div className={styles.panelHeader}>
              <h3>Properties</h3>
              <button 
                className={styles.toggleButton}
                onClick={() => setShowStylePanel(!showStylePanel)}
              >
                <Palette size={16} />
              </button>
            </div>
            <div className={styles.propertiesForm}>
              <div className={styles.propertyGroup}>
                <label>Position</label>
                <div className={styles.propertyRow}>
                  <input 
                    type="number" 
                    placeholder="X" 
                    value={components.find(c => c.id === selectedComponent)?.position.x || 0}
                    onChange={(e) => {
                      const component = components.find(c => c.id === selectedComponent);
                      if (component) {
                        updateComponent(selectedComponent, {
                          position: { ...component.position, x: parseInt(e.target.value) || 0 }
                        });
                      }
                    }}
                  />
                  <input 
                    type="number" 
                    placeholder="Y"
                    value={components.find(c => c.id === selectedComponent)?.position.y || 0}
                    onChange={(e) => {
                      const component = components.find(c => c.id === selectedComponent);
                      if (component) {
                        updateComponent(selectedComponent, {
                          position: { ...component.position, y: parseInt(e.target.value) || 0 }
                        });
                      }
                    }}
                  />
                </div>
              </div>
              <div className={styles.propertyGroup}>
                <label>Size</label>
                <div className={styles.propertyRow}>
                  <input 
                    type="number" 
                    placeholder="Width"
                    value={components.find(c => c.id === selectedComponent)?.size.width || 200}
                    onChange={(e) => {
                      const component = components.find(c => c.id === selectedComponent);
                      if (component) {
                        updateComponent(selectedComponent, {
                          size: { ...component.size, width: parseInt(e.target.value) || 200 }
                        });
                      }
                    }}
                  />
                  <input 
                    type="number" 
                    placeholder="Height"
                    value={components.find(c => c.id === selectedComponent)?.size.height || 100}
                    onChange={(e) => {
                      const component = components.find(c => c.id === selectedComponent);
                      if (component) {
                        updateComponent(selectedComponent, {
                          size: { ...component.size, height: parseInt(e.target.value) || 100 }
                        });
                      }
                    }}
                  />
                </div>
              </div>
              <div className={styles.propertyGroup}>
                <label>Background</label>
                <input 
                  type="color" 
                  className={styles.colorInput}
                  value={components.find(c => c.id === selectedComponent)?.styles.backgroundColor || '#ffffff'}
                  onChange={(e) => {
                    const component = components.find(c => c.id === selectedComponent);
                    if (component) {
                      updateComponent(selectedComponent, {
                        styles: { ...component.styles, backgroundColor: e.target.value }
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageBuilder;
