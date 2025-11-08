import { useLayoutEffect, useRef, useCallback } from 'react';

function useDragScroll({ draggingClass = 'is-dragging' } = {}) {
    const elementRef = useRef(null);
    const listenersRef = useRef(null);

    const setElement = useCallback((element) => {
        // Clean up previous listeners
        if (listenersRef.current && elementRef.current) {
            const { element: prevElement, cleanup } = listenersRef.current;
            cleanup();
            listenersRef.current = null;
        }

        elementRef.current = element;

        // Set up new listeners if element exists
        if (element) {
            setupListeners(element);
        }
    }, [draggingClass]);

    const setupListeners = useCallback((element) => {
        if (listenersRef.current) return; // Already set up

        let isDragging = false;
        let pointerId = null;
        let startX = 0;
        let startY = 0;
        let scrollLeft = 0;

        const beginDrag = (clientX, clientY = 0) => {
            isDragging = true;
            startX = clientX;
            startY = clientY;
            scrollLeft = element.scrollLeft;
            element.classList.add(draggingClass);
        };

        const moveDrag = (clientX, clientY = 0) => {
            if (!isDragging) return;
            const deltaX = clientX - startX;
            const deltaY = Math.abs(clientY - startY);

            if (deltaY > Math.abs(deltaX)) {
                endDrag();
                return;
            }

            element.scrollLeft = scrollLeft - deltaX;
        };

        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            element.classList.remove(draggingClass);
            if (pointerId != null) {
                try {
                    element.releasePointerCapture(pointerId);
                } catch {}
            }
            pointerId = null;
        };

        const onPointerDown = (event) => {
            if (event.pointerType !== 'touch' && event.pointerType !== 'mouse') return;
            if (event.pointerType === 'mouse' && event.button !== 0) return;

            pointerId = event.pointerId;
            beginDrag(event.clientX, event.clientY);
            try {
                element.setPointerCapture(pointerId);
            } catch {}
        };

        const onPointerMove = (event) => {
            if (!isDragging) return;
            if (pointerId != null && event.pointerId !== pointerId) return;

            event.preventDefault();
            moveDrag(event.clientX, event.clientY);
        };

        const onPointerUp = () => endDrag();
        const onPointerCancel = () => endDrag();
        const onPointerLeave = () => endDrag();

        const onTouchStart = (event) => {
            if (event.touches.length !== 1) return;
            const touch = event.touches[0];
            pointerId = null;
            beginDrag(touch.clientX, touch.clientY);
        };

        const onTouchMove = (event) => {
            if (!isDragging) return;
            const touch = event.touches[0];
            moveDrag(touch.clientX, touch.clientY);
            event.preventDefault();
        };

        const onTouchEnd = () => endDrag();
        const onTouchCancel = () => endDrag();

        element.addEventListener('pointerdown', onPointerDown);
        element.addEventListener('pointermove', onPointerMove, { passive: false });
        element.addEventListener('pointerup', onPointerUp);
        element.addEventListener('pointercancel', onPointerCancel);
        element.addEventListener('pointerleave', onPointerLeave);

        element.addEventListener('touchstart', onTouchStart, { passive: true });
        element.addEventListener('touchmove', onTouchMove, { passive: false });
        element.addEventListener('touchend', onTouchEnd);
        element.addEventListener('touchcancel', onTouchCancel);

        const cleanup = () => {
            endDrag();
            element.removeEventListener('pointerdown', onPointerDown);
            element.removeEventListener('pointermove', onPointerMove, { passive: false });
            element.removeEventListener('pointerup', onPointerUp);
            element.removeEventListener('pointercancel', onPointerCancel);
            element.removeEventListener('pointerleave', onPointerLeave);

            element.removeEventListener('touchstart', onTouchStart);
            element.removeEventListener('touchmove', onTouchMove);
            element.removeEventListener('touchend', onTouchEnd);
            element.removeEventListener('touchcancel', onTouchCancel);
        };

        listenersRef.current = { element, cleanup };
    }, [draggingClass]);

    // Clean up on unmount
    useLayoutEffect(() => {
        return () => {
            if (listenersRef.current) {
                listenersRef.current.cleanup();
                listenersRef.current = null;
            }
        };
    }, []);

    return setElement;
}

export default useDragScroll;
