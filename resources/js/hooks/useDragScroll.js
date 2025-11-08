import { useEffect } from 'react';

function useDragScroll(ref, { draggingClass = 'is-dragging' } = {}) {
    const element = ref?.current;

    useEffect(() => {
        if (!element) return;

        let isDragging = false;
        let pointerId = null;
        let startX = 0;
        let startY = 0;
        let scrollLeft = 0;

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

            isDragging = true;
            pointerId = event.pointerId;
            startX = event.clientX;
            startY = event.clientY;
            scrollLeft = element.scrollLeft;
            element.classList.add(draggingClass);

            try {
                element.setPointerCapture(pointerId);
            } catch {}
        };

        const onPointerMove = (event) => {
            if (!isDragging) return;
            if (pointerId != null && event.pointerId !== pointerId) return;

            const deltaX = event.clientX - startX;
            const deltaY = Math.abs(event.clientY - startY);

            if (deltaY > Math.abs(deltaX)) {
                endDrag();
                return;
            }

            event.preventDefault();
            element.scrollLeft = scrollLeft - deltaX;
        };

        const onPointerUp = () => endDrag();
        const onPointerCancel = () => endDrag();
        const onPointerLeave = () => endDrag();

        element.addEventListener('pointerdown', onPointerDown);
        element.addEventListener('pointermove', onPointerMove, { passive: false });
        element.addEventListener('pointerup', onPointerUp);
        element.addEventListener('pointercancel', onPointerCancel);
        element.addEventListener('pointerleave', onPointerLeave);

        return () => {
            endDrag();
            element.removeEventListener('pointerdown', onPointerDown);
            element.removeEventListener('pointermove', onPointerMove, { passive: false });
            element.removeEventListener('pointerup', onPointerUp);
            element.removeEventListener('pointercancel', onPointerCancel);
            element.removeEventListener('pointerleave', onPointerLeave);
        };
    }, [element, draggingClass]);
}

export default useDragScroll;
