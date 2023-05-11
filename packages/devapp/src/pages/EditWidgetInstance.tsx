import { useParams } from 'react-router';
import { forwardRef, lazy, Suspense, useMemo } from 'react';
import widgetsManifest from '../widgets-manifest';
import clsx from 'clsx';
import { useLayoutManager } from '../components/LayoutManager';
import useRefCallback from '@oss-widgets/ui/hooks/ref-callback';
import { Link } from 'react-router-dom';

export default function EditWidgetInstance () {
  const id = useParams<{ id: string }>().id ?? '__NEVER__';
  const { useItem, updateItemProps } = useLayoutManager();

  const item = useItem(id);

  const widget = useMemo(() => {
    if (!item) {
      return undefined;
    }
    return widgetsManifest[item.name];
  }, [item?.name]);

  const Component = useMemo(() => {
    if (widget) {
      return lazy(() => widget.module().then(module => {
        const Component = forwardRef(module.default);
        return {
          default: (props: any) => {
            const handlePropChange = useRefCallback((key: string, value: string) => {
              updateItemProps(id, (props: any) => ({ ...props, [key]: value }));
            });

            return (
              <Component
                {...props}
                {...module.configurablePropsOverwrite}
                className={clsx('w-full h-full', module.configurablePropsOverwrite?.className, props.className)}
                onPropChange={handlePropChange}
              />
            );
          },
        };
      }));
    } else {
      return () => {
        return <div>No such widget</div>;
      };
    }
  }, [widget]);

  if (!item) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-gray-700 gap-4">
        Widget not found
        <Link to="/">HOME</Link>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <div className="p-2 bg-gray-200 text-gray-700 border-b flex gap-2 items-center h-[36px]">
        <Link to="/">HOME</Link>
        <span>
          {'Editing '}
          <b>{item.name}#{item.id}</b>
        </span>
        <span className="flex-1" />
        <button className="text-sm bg-gray-700 rounded text-white px-2">
          Duplicate
        </button>
        <button className="text-sm bg-red-700 rounded text-white px-2">
          Delete
        </button>
      </div>
      <div className="widget w-full h-[calc(100%-36px)]">
        <Suspense
          fallback="loading..."
        >
          <Component {...item.props} />
        </Suspense>
      </div>
    </div>
  );
}