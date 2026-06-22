import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ImageCarousel.css';

interface ImageCarouselProps {
    images: string[];
    altText?: string;
}

const ImageCarousel = ({ images, altText = 'Gallery Image' }: ImageCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    if (images.length === 1) {
        return (
            <div className="carousel-single-image">
                <img src={images[0]} alt={altText} />
            </div>
        );
    }

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    return (
        <div className="carousel-container">
            <div className="carousel-image-wrapper">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentIndex}
                        src={images[currentIndex]}
                        alt={`${altText} - Slide ${currentIndex + 1}`}
                        className="carousel-image"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                    />
                </AnimatePresence>

                <button className="carousel-btn prev-btn" onClick={(e) => { e.stopPropagation(); prevSlide(); }} aria-label="Previous image">
                    <ChevronLeft size={24} />
                </button>
                <button className="carousel-btn next-btn" onClick={(e) => { e.stopPropagation(); nextSlide(); }} aria-label="Next image">
                    <ChevronRight size={24} />
                </button>
            </div>

            <div className="carousel-indicators">
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageCarousel;
