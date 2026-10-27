import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Slider,
  Typography,
  Box,
} from "@mui/material";
import { useGlobal, setGlobal } from "reactn";
import { close_menu_and_dialog } from "../utils/close_menu";
import { mark_local_changed } from "../utils/mark_local_changed";

export const EditAnnotationDialog = () => {
  const [dialog] = useGlobal("dialog");
  const [clicked_annotation_index] = useGlobal("clicked_annotation_index");
  const [annotations] = useGlobal("annotations");

  const open = dialog === "EditAnnotation";

  const annotation =
    clicked_annotation_index !== null
      ? annotations[clicked_annotation_index]
      : undefined;

  const onClose = () => {
    close_menu_and_dialog();
    setGlobal({ clicked_annotation_index: null });
  };

  if (!annotation) {
    return null;
  }

  const updateAnnotation = (updates: any) => {
    if (clicked_annotation_index === null) return;

    const newAnnotations = [...annotations];
    newAnnotations[clicked_annotation_index] = {
      ...annotation,
      ...updates,
    };
    setGlobal({ annotations: newAnnotations });
    mark_local_changed();
  };

  const updateCustom = (customUpdates: any) => {
    updateAnnotation({
      custom: {
        ...annotation.custom,
        ...customUpdates,
      },
    });
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (clicked_annotation_index === null) return;

    // Firestore rejects undefined, so drop the key for an empty label
    const { label: _, ...rest } = annotation;
    const value = e.target.value;
    const newAnnotations = [...annotations];
    newAnnotations[clicked_annotation_index] =
      value === "" ? rest : { ...rest, label: value };
    setGlobal({ annotations: newAnnotations });
    mark_local_changed();
  };

  const handleStrokeWidthChange = (_: Event, value: number | number[]) => {
    updateCustom({ stroke_width: value as number });
  };

  const handleOpacityChange = (_: Event, value: number | number[]) => {
    updateCustom({ opacity: value as number });
  };

  const handleArrowSizeChange = (_: Event, value: number | number[]) => {
    updateCustom({ arrow_head_size: value as number });
  };

  const handleReverseArrow = () => {
    if (clicked_annotation_index === null) return;

    const newAnnotations = [...annotations];
    const reversedHeads = [...annotation.heads].reverse();
    const reversedItems = [...annotation.items].reverse();
    newAnnotations[clicked_annotation_index] = {
      ...annotation,
      heads: reversedHeads,
      items: reversedItems,
    };
    setGlobal({ annotations: newAnnotations });
    mark_local_changed();
  };

  const handleDelete = () => {
    if (
      clicked_annotation_index === null ||
      !window.confirm("Delete this annotation?")
    ) {
      return;
    }

    const newAnnotations = annotations.filter(
      (_, i) => i !== clicked_annotation_index
    );
    setGlobal({ annotations: newAnnotations });
    mark_local_changed();
    onClose();
  };

  const label = annotation.label ?? "";
  const strokeWidth = annotation.custom?.stroke_width ?? 1;
  const opacity = annotation.custom?.opacity ?? 0.2;
  const arrowSize = annotation.custom?.arrow_head_size ?? 10;

  // Check if annotation has any arrow heads
  const hasArrowHead = annotation.heads.some((head) => head === "arrow");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-testid="edit-annotation-dialog"
      keepMounted={false}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Edit Annotation</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Label"
            value={label}
            onChange={handleLabelChange}
            multiline
            rows={3}
            variant="outlined"
            margin="normal"
          />

          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>Stroke Width: {strokeWidth}</Typography>
            <Slider
              value={strokeWidth}
              onChange={handleStrokeWidthChange}
              min={1}
              max={20}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>Opacity: {opacity.toFixed(2)}</Typography>
            <Slider
              value={opacity}
              onChange={handleOpacityChange}
              min={0}
              max={1}
              step={0.1}
              valueLabelDisplay="auto"
            />
          </Box>

          {hasArrowHead && (
            <Box sx={{ mt: 3 }}>
              <Typography gutterBottom>Arrow Size: {arrowSize}</Typography>
              <Slider
                value={arrowSize}
                onChange={handleArrowSizeChange}
                min={5}
                max={50}
                step={5}
                valueLabelDisplay="auto"
              />
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Connected items: {annotation.items.join(", ")}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDelete} color="error">
          Delete
        </Button>
        <Button onClick={handleReverseArrow} color="secondary">
          Reverse Arrow
        </Button>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
