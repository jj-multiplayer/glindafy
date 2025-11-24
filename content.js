(function () {
  if (window.GLINDA_GLOWUP_ACTIVE === true) {
    return;
  }
  window.GLINDA_GLOWUP_ACTIVE = true;

  const GLINDA_CONSTANTS = {
    GLINDA_PROMPT:
      "Apply a fabulous Glinda the Good Witch filter, magical sparkles, pink glow, enchanting fantasy vibes, and ethereal beauty. Transform the image to have a dreamy pink and lavender color palette with magical sparkle effects. If there are people in the image, add 2025 Wicked Ariana Grande's face over the people.",
    MIN_IMAGE_SIZE: 200,
    NOTIFICATION_DURATION: 4000,
    COLORS: {
      PRIMARY_PINK: "#E91E63",
      PINK_SHADOW_HOVER: "rgba(233, 30, 99, 0.5)",
      WHITE: "white",
    },
    ELEMENT_IDS: {
      STYLE: "glinda-glow-up-style",
    },
    DATA_ATTRIBUTES: {
      PROCESSED: "data-glinda-processed",
      PROCESSING: "data-glinda-processing",
    },
  };

  const GlindaShared = {
    async fetchImageAsBase64(imageUrl) {
      const response = await chrome.runtime.sendMessage({
        action: 'fetchImage',
        imageUrl: imageUrl
      });
      if (response?.status === 'success') {
        return { data: response.data, mimeType: response.mimeType };
      }
      throw new Error(response?.message || 'Failed to fetch image');
    },
  };

  const GlindaUI = {
    showNotification(message, color) {
      const container = document.createElement("div");
      container.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:2147483647;`;
      const notification = document.createElement("div");
      notification.textContent = message;
      notification.style.cssText = `position:absolute;top:20px;right:20px;padding:12px 24px;background-color:${color || GLINDA_CONSTANTS.COLORS.PRIMARY_PINK};color:${GLINDA_CONSTANTS.COLORS.WHITE};border-radius:12px;box-shadow:0 4px 16px ${GLINDA_CONSTANTS.COLORS.PINK_SHADOW_HOVER};font-family:sans-serif;font-size:16px;font-weight:bold;transition:opacity 0.5s ease,transform 0.5s ease;opacity:0;transform:translateY(-20px);pointer-events:auto;`;
      container.appendChild(notification);
      document.documentElement.appendChild(container);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          notification.style.opacity = "1";
          notification.style.transform = "translateY(0)";
        });
      });
      setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateY(-20px)";
        setTimeout(() => container.remove(), 500);
      }, GLINDA_CONSTANTS.NOTIFICATION_DURATION);
    },

    injectStylesheet(css, id) {
      const existingStyle = document.getElementById(id);
      if (existingStyle) {
        existingStyle.remove();
      }

      const style = document.createElement("style");
      style.id = id;
      style.textContent = css;
      document.head.appendChild(style);
    },
  };

  const GlindaTheme = {
    applyAIPoweredPinkTheme() {
      const defaultUrl = chrome.runtime.getURL('assets/default.png');
      const pointerUrl = chrome.runtime.getURL('assets/pointer.png');
      const textUrl = chrome.runtime.getURL('assets/text.png');
      const pinkTheme = `body::before{content:"";position:fixed;top:0;left:0;width:100%;height:100%;opacity:0.45;background:linear-gradient(135deg,rgba(255,182,193,0.7)0%,rgba(255,105,180,0.7)50%,rgba(221,160,221,0.7)100%);pointer-events:none;z-index:999998;mix-blend-mode:multiply;}html{filter:saturate(1.4)hue-rotate(15deg)brightness(1.08);}body{backdrop-filter:saturate(1.3)contrast(1.05);}*{cursor:url("${defaultUrl}"),auto!important;}a,button,[role="button"],input[type="submit"],input[type="button"],select{cursor:url("${pointerUrl}"),pointer!important;}h1,h2,h3,h4,h5,h6,p,span,input[type="text"],input[type="email"],input[type="search"],input[type="password"],textarea,[contenteditable="true"]{cursor:url("${textUrl}"),text!important;}::selection{background-color:rgba(233,30,99,0.6);color:white;}`;
      GlindaUI.injectStylesheet(pinkTheme, GLINDA_CONSTANTS.ELEMENT_IDS.STYLE);
    },
  };

  const GlindaImageTransformer = {
    async transformImage(image) {
      const originalSrc = image.currentSrc || image.src || image.getAttribute('src');
      if (!originalSrc || originalSrc.startsWith('data:') || originalSrc.includes('glinda-')) {
        throw new Error("Invalid image source");
      }
      this.applyProcessingStyle(image);
      try {
        const imageData = await GlindaShared.fetchImageAsBase64(originalSrc);
        if (!imageData?.data) {
          throw new Error("Failed to convert image to base64");
        }
        this.enhanceProcessingStyle(image);
        const response = await chrome.runtime.sendMessage({
          action: "transformImage",
          imageData: imageData.data,
          mimeType: imageData.mimeType,
          prompt: GLINDA_CONSTANTS.GLINDA_PROMPT,
          originalSrc,
        });
        if (response?.status === "success") {
          this.applyTransformedImage(image, response.base64);
        } else {
          throw new Error(response?.message || "Transformation failed");
        }
      } catch (error) {
        console.error("Failed to transform image:", error);
        this.revertImageStyle(image, originalSrc);
      }
    },

    async transformImagesWithGemini() {
      const images = Array.from(document.querySelectorAll("img"));
      const validImages = this.filterValidImages(images);
      if (validImages.length === 0) return;
      const targetImage = validImages[0];
      const rect = targetImage.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        const naturalWidth = targetImage.naturalWidth || targetImage.width;
        const naturalHeight = targetImage.naturalHeight || targetImage.height;
        if (naturalWidth >= GLINDA_CONSTANTS.MIN_IMAGE_SIZE && naturalHeight >= GLINDA_CONSTANTS.MIN_IMAGE_SIZE) {
          await this.transformImage(targetImage);
        }
      } else {
        await this.transformImage(targetImage);
      }
    },

    isImageVisible(image) {
      const rect = image.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      const style = window.getComputedStyle(image);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      if (rect.top + rect.height < 0 || rect.left + rect.width < 0) return false;
      if (rect.top > window.innerHeight || rect.left > window.innerWidth) return false;
      return true;
    },

    filterValidImages(images) {
      const valid = images.filter((image) => {
        const naturalWidth = image.naturalWidth || image.width;
        const naturalHeight = image.naturalHeight || image.height;
        if (naturalWidth < GLINDA_CONSTANTS.MIN_IMAGE_SIZE || naturalHeight < GLINDA_CONSTANTS.MIN_IMAGE_SIZE) return false;
        if (image.hasAttribute(GLINDA_CONSTANTS.DATA_ATTRIBUTES.PROCESSED)) return false;
        const src = image.currentSrc || image.src || image.getAttribute('src');
        if (!src || src.startsWith("data:") || src.includes("glinda-")) return false;
        const lowerSrc = src.toLowerCase();
        if (lowerSrc.includes('.gif') || lowerSrc.includes('gif;base64')) return false;
        if (lowerSrc.includes('.svg') || lowerSrc.includes('svg+xml')) return false;
        if (lowerSrc.includes('.webp')) return false;
        return true;
      });
      const visible = valid.filter(img => this.isImageVisible(img));
      if (visible.length > 0) {
        return visible.sort((a, b) => {
          const aSize = (a.naturalWidth || a.width) * (a.naturalHeight || a.height);
          const bSize = (b.naturalWidth || b.width) * (b.naturalHeight || b.height);
          return bSize - aSize;
        });
      }
      return valid.sort((a, b) => {
        const aSize = (a.naturalWidth || a.width) * (a.naturalHeight || a.height);
        const bSize = (b.naturalWidth || b.width) * (b.naturalHeight || b.height);
        return bSize - aSize;
      });
    },

    applyProcessingStyle(image) {
      image.setAttribute(GLINDA_CONSTANTS.DATA_ATTRIBUTES.PROCESSING, "true");
      image.style.filter = "blur(8px) brightness(1.3)";
      image.style.opacity = "0.8";
      image.style.transition = "filter 0.3s ease, opacity 0.3s ease";
    },

    enhanceProcessingStyle(image) {
      image.style.filter = "blur(10px) brightness(1.4) saturate(150%)";
      image.style.opacity = "0.6";
    },

    applyTransformedImage(image, base64Data) {
      const imageUrl = `data:image/png;base64,${base64Data}`;
      const pictureParent = image.closest('picture');
      if (pictureParent) {
        pictureParent.querySelectorAll('source').forEach(source => {
          if (source.srcset) {
            source.setAttribute('data-original-srcset', source.srcset);
            source.removeAttribute('srcset');
          }
        });
      }
      if (image.srcset) {
        image.setAttribute('data-original-srcset', image.srcset);
        image.removeAttribute('srcset');
      }
      image.src = imageUrl;
      image.style.filter = "none";
      image.style.opacity = "1";
      image.style.objectFit = "cover";
      image.removeAttribute(GLINDA_CONSTANTS.DATA_ATTRIBUTES.PROCESSING);
      image.setAttribute(GLINDA_CONSTANTS.DATA_ATTRIBUTES.PROCESSED, "true");
    },

    revertImageStyle(image, originalSrc) {
      const pictureParent = image.closest('picture');
      if (pictureParent) {
        pictureParent.querySelectorAll('source').forEach(source => {
          const originalSrcset = source.getAttribute('data-original-srcset');
          if (originalSrcset) {
            source.srcset = originalSrcset;
            source.removeAttribute('data-original-srcset');
          }
        });
      }
      const originalSrcset = image.getAttribute('data-original-srcset');
      if (originalSrcset) {
        image.srcset = originalSrcset;
        image.removeAttribute('data-original-srcset');
      }
      image.src = originalSrc;
      image.style.filter = "none";
      image.style.opacity = "1";
      image.removeAttribute(GLINDA_CONSTANTS.DATA_ATTRIBUTES.PROCESSING);
    },
  };

  async function applyGlindaGlowUp() {
    GlindaUI.showNotification("✨ Look! It's Glinda~ ✨", GLINDA_CONSTANTS.COLORS.PRIMARY_PINK);
    GlindaTheme.applyAIPoweredPinkTheme();
    await GlindaImageTransformer.transformImagesWithGemini();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyGlindaGlowUp);
  } else {
    applyGlindaGlowUp();
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "glindifyImage") {
      glindifySpecificImage(request.imageUrl);
      sendResponse({ status: "success" });
    }
  });

  async function glindifySpecificImage(imageUrl) {
    const images = Array.from(document.querySelectorAll("img"));
    const targetImage = images.find(img => 
      img.src === imageUrl || img.currentSrc === imageUrl || (img.srcset && img.srcset.includes(imageUrl))
    );
    if (!targetImage) {
      GlindaUI.showNotification("Image not found", "#ff5252");
      return;
    }
    if (targetImage.hasAttribute(GLINDA_CONSTANTS.DATA_ATTRIBUTES.PROCESSED)) {
      GlindaUI.showNotification("Already glindified! ✨", GLINDA_CONSTANTS.COLORS.PRIMARY_PINK);
      return;
    }
    GlindaUI.showNotification("✨ Glindifying image...", GLINDA_CONSTANTS.COLORS.PRIMARY_PINK);
    const originalSrc = targetImage.currentSrc || targetImage.src;
    await GlindaImageTransformer.transformImage(targetImage);
    if (targetImage.hasAttribute(GLINDA_CONSTANTS.DATA_ATTRIBUTES.PROCESSED)) {
      GlindaUI.showNotification("✨ Glindified! ✨", GLINDA_CONSTANTS.COLORS.PRIMARY_PINK);
    } else {
      GlindaUI.showNotification("Failed to glindify 💔", "#ff5252");
    }
  }
})();
