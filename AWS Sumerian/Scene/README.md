# Sumerian glTF Export

## Overview
glTF (GL Transmission Format) is a file type standard developed by the [Khronos Group](https://www.khronos.org/gltf/) for the efficient transmission of 3D content. With glTF, users have a common format for working with and publishing 3D assets across a variety of authoring tools, engines, and services.

Sumerian provides you the option to export a scene as a glTF file.

The following will always be **included** in the export if it is present in the scene:
* Entity Geometry
* Materials (Classic and PBR)
* Scene layout
* Textures

The following will always be **excluded** from the export:
* 2D Shapes
* Animations
* HMDCamera
* Particles
* Physics
* Scripts
* Skeletons
* State Machine Behaviors
* Timelines
* VRCameraRig

If an entity contains an excluded component, then that entity will be present in the glTF without the excluded component.

## Additional Export Options

You can opt to include the following assets in the exported glTF:

* **Cameras**  
If the **Cameras** option is checked, **Cameras** and **Camera components** will be included in the export. If the **Cameras** option is unchecked, then all entities with a Camera component will export without the Camera component. When importing a glTF file into some glTF viewers, you may be expected to calculate and apply the camera aspect ratio yourself by dividing canvas width by height.
* **Lights**  
If the **Lights** option is checked, the following **Lights** and **Light components** will be included in the export:
     * Directional
     * Spot
     * Point  

   If the **Lights** option is unchecked, all entities with a Light component will export without the Light component. Not all tools and engines handle lighting data the same way, so your scene's lighting may require some adjustment after importing it to another program.
* **Image-Based Lighting (IBL)**  
If the **Image-Based Lighting (IBL)** option is checked, any environment lighting placed on the scene will be included in the export as a .hdr file. You can set or adjust the environment lighting in your scene from the **Environment component** of the top-level scene entity. If the **Image-Based Lighting (IBL)** option is unchecked, no environment lighting will be exported.
* **Unused Assets**  
If the **Unused Assets** option is checked, then any entity or texture assets that are not placed within the scene but exist within the **Assets** panel will be included in the export. If the **Unused Assets** option is unchecked, only entities and textures that have already been added to the scene will be included.

## Materials

The core glTF specification only supports Physically-Based Rendering (PBR) materials, specifically the metallic roughness material model. The following is how each Sumerian material is handled for glTF:

* **PBR Metalness** materials map directly to the glTF PBR metallic roughness specification. However, not all texture channels available in Sumerian are currently officially supported by the glTF specification. Here is how Sumerian will handle the different textures on your PBR Metalness material upon export:
     * Base Color (Albedo): Exported as-is
     * Metalness: Combined with Roughness channel
     * Roughness: Combined with Metalness channel
     * Normal: Exported as-is
     * Specular FO: Not currently supported by the glTF specification
     * Emissive: Exported as-is
     * Ambient Occlusion: Combined with Cavity channel
     * Cavity: Combined with Ambient Occlusion channel
     * Clear Coat: Not currently supported by the glTF specification
* **PBR Specular:** Uses the glTF extension **KHR_materials_pbrSpecularGlossiness**, which is supported by many engines including [Babylon.js](https://www.babylonjs.com) and [Three.js](https://threejs.org). However, not all texture channels available in Sumerian are currently officially supported by the glTF specification. Here is how Sumerian will handle the different textures on your PBR Specular material upon export:
     * Diffuse: Exported as-is
     * Specular: Combined with Glossiness channel
     * Glossiness: Combined with Specular channel
     * Normal: Exported as-is
     * Emissive: Exported as-is
     * Ambient Occlusion: Combined with Cavity channel
     * Cavity: Combined with Ambient Occlusion channel
     * Clear Coat: Not currently supported by the glTF specification
* **Classic:** All Classic materials will be converted to PBR metallic roughness. However, some properties will be dropped in the conversion, sometimes changing the appearance of the material. These Classic material properties include:
     * Ambient
     * Culling
     * Depth
     * Reflectivity
     * Refractivity
     * Shading
