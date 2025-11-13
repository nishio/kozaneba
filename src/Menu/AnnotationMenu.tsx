import { Menu, MenuItem } from "@mui/material";
import React from "react";
import { setGlobal, useGlobal } from "reactn";
import { close_context_menu } from "../utils/close_context_menu";
import { open_dialog } from "../utils/open_dialog";
import { mark_local_changed } from "../utils/mark_local_changed";

export const AnnotationMenu = () => {
  const [menu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const [clicked_annotation_index] = useGlobal("clicked_annotation_index");
  const [annotations] = useGlobal("annotations");

  const open = menu === "Annotation";
  if (!open || clicked_annotation_index === null) return null;

  const annotation = annotations[clicked_annotation_index];
  if (!annotation) return null;

  const onEditLabel = () => {
    const currentLabel = annotation.custom?.label ?? "";
    const newLabel = prompt("Edit label:", currentLabel);
    if (newLabel !== null) {
      const newAnnotations = [...annotations];
      newAnnotations[clicked_annotation_index] = {
        ...annotation,
        custom: {
          ...annotation.custom,
          label: newLabel,
        },
      };
      setGlobal({ annotations: newAnnotations });
      mark_local_changed();
    }
    close_context_menu();
  };

  const onShowDetails = () => {
    open_dialog("EditAnnotation");
    close_context_menu();
  };

  const onIncreaseStrokeWidth = () => {
    const currentWidth = annotation.custom?.stroke_width ?? 1;
    const newAnnotations = [...annotations];
    newAnnotations[clicked_annotation_index] = {
      ...annotation,
      custom: {
        ...annotation.custom,
        stroke_width: currentWidth + 1,
      },
    };
    setGlobal({ annotations: newAnnotations });
    mark_local_changed();
    close_context_menu();
  };

  const onDecreaseStrokeWidth = () => {
    const currentWidth = annotation.custom?.stroke_width ?? 1;
    if (currentWidth <= 1) return;
    const newAnnotations = [...annotations];
    newAnnotations[clicked_annotation_index] = {
      ...annotation,
      custom: {
        ...annotation.custom,
        stroke_width: currentWidth - 1,
      },
    };
    setGlobal({ annotations: newAnnotations });
    mark_local_changed();
    close_context_menu();
  };

  const onIncreaseOpacity = () => {
    const currentOpacity = annotation.custom?.opacity ?? 0.2;
    const newAnnotations = [...annotations];
    newAnnotations[clicked_annotation_index] = {
      ...annotation,
      custom: {
        ...annotation.custom,
        opacity: Math.min(1, currentOpacity + 0.1),
      },
    };
    setGlobal({ annotations: newAnnotations });
    mark_local_changed();
    close_context_menu();
  };

  const onDecreaseOpacity = () => {
    const currentOpacity = annotation.custom?.opacity ?? 0.2;
    const newAnnotations = [...annotations];
    newAnnotations[clicked_annotation_index] = {
      ...annotation,
      custom: {
        ...annotation.custom,
        opacity: Math.max(0, currentOpacity - 0.1),
      },
    };
    setGlobal({ annotations: newAnnotations });
    mark_local_changed();
    close_context_menu();
  };

  const onReverseArrow = () => {
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
    close_context_menu();
  };

  const onDelete = () => {
    if (!window.confirm("Delete this annotation?")) {
      return;
    }
    const newAnnotations = annotations.filter(
      (_, i) => i !== clicked_annotation_index
    );
    setGlobal({
      annotations: newAnnotations,
      clicked_annotation_index: null
    });
    mark_local_changed();
    close_context_menu();
  };

  return (
    <Menu
      anchorEl={anchor}
      keepMounted
      open={open}
      onClose={close_context_menu}
    >
      <MenuItem onClick={onEditLabel}>Edit Label</MenuItem>
      <MenuItem onClick={onShowDetails}>Show Details</MenuItem>
      <MenuItem onClick={onIncreaseStrokeWidth}>Thicker</MenuItem>
      <MenuItem onClick={onDecreaseStrokeWidth}>Thinner</MenuItem>
      <MenuItem onClick={onIncreaseOpacity}>More Opaque</MenuItem>
      <MenuItem onClick={onDecreaseOpacity}>More Transparent</MenuItem>
      <MenuItem onClick={onReverseArrow}>Reverse Arrow</MenuItem>
      <MenuItem onClick={onDelete}>Delete</MenuItem>
    </Menu>
  );
};
