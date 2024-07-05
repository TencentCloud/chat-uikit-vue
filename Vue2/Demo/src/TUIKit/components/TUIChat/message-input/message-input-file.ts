import Image from '@tiptap/extension-image';

export default Image.extend({
  name: 'custom-image',

  addAttributes() {
    return {
      ...(Image.config as any).addAttributes(),
      class: {
        default: 'image',
        rendered: false,
      },
    };
  },

  addCommands() {
    return {
      setImage: options => ({ tr, commands }) => {
        if ((tr.selection as any)?.node?.type?.name == 'custom-image') {
          return commands.updateAttributes('custom-image', options);
        } else {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        }
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    HTMLAttributes.class = (node.attrs.class?.includes('custom-image-') ? '' : 'custom-image-') + node.attrs.class;
    return [
      'img',
      HTMLAttributes,
    ];
  },
});
