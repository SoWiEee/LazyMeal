import { useQuasar } from 'quasar'

export const useNotification = () => {
    const $q = useQuasar()

    const showNotification = (result) => {
        // 讓 store 回傳的 result 包含 type: 'add' | 'remove' | 'info'
        const config = {
            position: 'top',
            message: result.message,
        }

        if (!result.success) {
            Object.assign(config, {
                color: 'negative',
                icon: 'warning',
                timeout: 2000,
            })
        } else {
            const successStyles = {
                add: { color: 'green-4', icon: 'check_circle' },
                info: { color: 'green-4', icon: 'check_circle' }, // '已在口袋名單中' 的情況
                remove: { color: 'red-4', icon: 'remove_circle' },
            }
            Object.assign(config, {
                ...successStyles[result.type || 'info'],
                timeout: 1500,
            })
        }

        $q.notify(config)
    }

  return { showNotification }
};