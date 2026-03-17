cmake_minimum_required(VERSION 3.16)
project(SphereKeyframe LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# OFX SDK paths
set(OFX_SDK_ROOT "/tmp/openfx" CACHE PATH "Path to OpenFX SDK root")
set(OFX_HEADER_DIR "${OFX_SDK_ROOT}/include")
set(OFX_SUPPORT_HEADER_DIR "${OFX_SDK_ROOT}/Support/include")
set(OFX_SUPPORT_LIB_DIR "${OFX_SDK_ROOT}/Support/Library")

# Collect OFX Support Library sources
file(GLOB OFX_SUPPORT_SOURCES "${OFX_SUPPORT_LIB_DIR}/*.cpp")

# Plugin sources
set(PLUGIN_SOURCES
    src/SphereKeyframe.cpp
)

# Build as a MODULE library (dylib → placed inside .ofx.bundle)
add_library(SphereKeyframe SHARED
    ${PLUGIN_SOURCES}
    ${OFX_SUPPORT_SOURCES}
)

target_include_directories(SphereKeyframe PRIVATE
    ${OFX_HEADER_DIR}
    ${OFX_SUPPORT_HEADER_DIR}
    ${OFX_SDK_ROOT}/Support/Plugins/include
)

# macOS: build as .ofx bundle
set_target_properties(SphereKeyframe PROPERTIES
    BUNDLE TRUE
    BUNDLE_EXTENSION "ofx.bundle"
    MACOSX_BUNDLE FALSE
    PREFIX ""
    SUFFIX ".ofx"
    LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}"
)

# Visibility: only export OFX entry points
set_target_properties(SphereKeyframe PROPERTIES
    CXX_VISIBILITY_PRESET hidden
    VISIBILITY_INLINES_HIDDEN ON
)

# Custom command to create proper .ofx.bundle structure
set(BUNDLE_DIR "${CMAKE_BINARY_DIR}/SphereKeyframe.ofx.bundle")
add_custom_command(TARGET SphereKeyframe POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E make_directory "${BUNDLE_DIR}/Contents/MacOS"
    COMMAND ${CMAKE_COMMAND} -E copy "$<TARGET_FILE:SphereKeyframe>" "${BUNDLE_DIR}/Contents/MacOS/SphereKeyframe.ofx"
    COMMAND ${CMAKE_COMMAND} -E copy "${CMAKE_CURRENT_SOURCE_DIR}/Info.plist" "${BUNDLE_DIR}/Contents/Info.plist"
    COMMENT "Creating OFX bundle at ${BUNDLE_DIR}"
)

# Install target: copy bundle to user OFX plugin directory
install(DIRECTORY "${BUNDLE_DIR}"
    DESTINATION "$ENV{HOME}/Library/OFX/Plugins"
)
