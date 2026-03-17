cmake_minimum_required(VERSION 3.16)
project(SphereReader LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# OFX SDK paths
set(OFX_SDK_ROOT "/tmp/openfx" CACHE PATH "Path to OpenFX SDK root")
set(OFX_HEADER_DIR "${OFX_SDK_ROOT}/include")
set(OFX_SUPPORT_HEADER_DIR "${OFX_SDK_ROOT}/Support/include")
set(OFX_SUPPORT_LIB_DIR "${OFX_SDK_ROOT}/Support/Library")

# Collect OFX Support Library sources
file(GLOB OFX_SUPPORT_SOURCES "${OFX_SUPPORT_LIB_DIR}/*.cpp")

# FFmpeg via pkg-config
find_package(PkgConfig REQUIRED)
pkg_check_modules(AVCODEC REQUIRED libavcodec)
pkg_check_modules(AVFORMAT REQUIRED libavformat)
pkg_check_modules(SWSCALE REQUIRED libswscale)
pkg_check_modules(AVUTIL REQUIRED libavutil)

# Plugin sources
set(PLUGIN_SOURCES
    src/SphereReader.cpp
)

# Build as a shared library (dylib → will be placed inside .ofx.bundle)
add_library(SphereReader SHARED
    ${PLUGIN_SOURCES}
    ${OFX_SUPPORT_SOURCES}
)

target_include_directories(SphereReader PRIVATE
    ${OFX_HEADER_DIR}
    ${OFX_SUPPORT_HEADER_DIR}
    ${OFX_SDK_ROOT}/Support/Plugins/include
    ${AVCODEC_INCLUDE_DIRS}
    ${AVFORMAT_INCLUDE_DIRS}
    ${SWSCALE_INCLUDE_DIRS}
    ${AVUTIL_INCLUDE_DIRS}
)

target_link_directories(SphereReader PRIVATE
    ${AVCODEC_LIBRARY_DIRS}
    ${AVFORMAT_LIBRARY_DIRS}
    ${SWSCALE_LIBRARY_DIRS}
    ${AVUTIL_LIBRARY_DIRS}
)

target_link_libraries(SphereReader PRIVATE
    ${AVCODEC_LIBRARIES}
    ${AVFORMAT_LIBRARIES}
    ${SWSCALE_LIBRARIES}
    ${AVUTIL_LIBRARIES}
)

# macOS: build as .ofx bundle
set_target_properties(SphereReader PROPERTIES
    BUNDLE TRUE
    BUNDLE_EXTENSION "ofx.bundle"
    MACOSX_BUNDLE FALSE
    PREFIX ""
    SUFFIX ".ofx"
    LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}"
)

# Visibility: only export OFX entry points
set_target_properties(SphereReader PROPERTIES
    CXX_VISIBILITY_PRESET hidden
    VISIBILITY_INLINES_HIDDEN ON
)

# Custom command to create proper .ofx.bundle structure
set(BUNDLE_DIR "${CMAKE_BINARY_DIR}/SphereReader.ofx.bundle")
add_custom_command(TARGET SphereReader POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E make_directory "${BUNDLE_DIR}/Contents/MacOS"
    COMMAND ${CMAKE_COMMAND} -E copy "$<TARGET_FILE:SphereReader>" "${BUNDLE_DIR}/Contents/MacOS/SphereReader.ofx"
    COMMAND ${CMAKE_COMMAND} -E copy "${CMAKE_CURRENT_SOURCE_DIR}/Info.plist" "${BUNDLE_DIR}/Contents/Info.plist"
    COMMENT "Creating OFX bundle at ${BUNDLE_DIR}"
)

# Install target: copy bundle to user OFX plugin directory
install(DIRECTORY "${BUNDLE_DIR}"
    DESTINATION "$ENV{HOME}/Library/OFX/Plugins"
)
