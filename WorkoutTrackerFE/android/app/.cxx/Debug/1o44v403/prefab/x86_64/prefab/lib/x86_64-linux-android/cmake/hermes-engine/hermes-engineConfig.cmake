if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "C:/Users/HP/.gradle/caches/8.13/transforms/b2759a7b7ff6d558a3f11be552a86e66/transformed/hermes-android-250829098.0.16-debug/prefab/modules/hermesvm/libs/android.x86_64/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/HP/.gradle/caches/8.13/transforms/b2759a7b7ff6d558a3f11be552a86e66/transformed/hermes-android-250829098.0.16-debug/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

